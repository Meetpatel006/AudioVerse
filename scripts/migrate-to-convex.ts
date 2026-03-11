/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │         MongoDB  →  Convex  One-Time Migration Script               │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Prerequisites:                                                      │
 * │    1. bun add dotenv (already done)                                  │
 * │    2. npx convex dev   ← push schema & generate types FIRST         │
 * │                                                                      │
 * │  Required env vars (.env.local or .env):                             │
 * │    MONGODB_URI        – your existing MongoDB connection string      │
 * │    MONGODB_DB_NAME    – database name  (default: "elevenlabs")       │
 * │    CONVEX_URL         – your Convex deployment URL                   │
 * │                                                                      │
 * │  Run:                                                                │
 * │    bunx tsx scripts/migrate-to-convex.ts                            │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import * as dotenv from "dotenv";
import { MongoClient, type Document } from "mongodb";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "elevenlabs";
const CONVEX_URL = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

if (!MONGODB_URI) {
  throw new Error("❌  MONGODB_URI is not set in .env / .env.local");
}

if (!CONVEX_URL) {
  throw new Error("❌  CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) is not set");
}

const migrationsApi = anyApi.migrations!;
const audioHistoryApi = anyApi.audioHistory!;
const upsertMigratedUserMutation =
  migrationsApi.upsertMigratedUser as Parameters<ConvexHttpClient["mutation"]>[0];
const upsertMigratedAudioHistoryMutation =
  audioHistoryApi.upsertMigratedAudioHistoryItem as Parameters<
    ConvexHttpClient["mutation"]
  >[0];

type ServiceType =
  | "styletts2"
  | "seedvc"
  | "make-an-audio"
  | "melody-maker"
  | "lyrics-to-music";

const VALID_SERVICES = new Set<ServiceType>([
  "styletts2",
  "seedvc",
  "make-an-audio",
  "melody-maker",
  "lyrics-to-music",
]);

interface MongoUser extends Document {
  _id: { toHexString(): string };
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MongoAudioHistory extends Document {
  _id: { toHexString(): string };
  title: string;
  voice: string | null;
  audioUrl: string | null;
  time: string;
  date: string;
  service: string;
  userId: string;
  blobName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MigratedUserResult {
  userId: string;
  email: string;
  mongoId: string;
}

const BATCH_SIZE = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTimestamp(value: Date | undefined | null): number {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.getTime();
  }

  return Date.now();
}

async function insertInBatches<T extends Record<string, unknown>>(
  convex: ConvexHttpClient,
  mutationRef: unknown,
  items: T[],
  label: string,
): Promise<{ migrated: number; failed: number }> {
  let migrated = 0;
  let failed = 0;
  const total = items.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (item) => {
        try {
          await convex.mutation(
            mutationRef as Parameters<ConvexHttpClient["mutation"]>[0],
            item as Parameters<ConvexHttpClient["mutation"]>[1],
          );
          migrated++;
        } catch (err) {
          failed++;
          console.warn(
            `  ⚠️  Skipped one ${label} item:`,
            (err as Error).message,
          );
        }
      }),
    );

    const done = Math.min(i + BATCH_SIZE, total);
    const pct = Math.round((done / total) * 100);
    console.log(`     ${label}: ${done}/${total}  (${pct}%)`);

    if (done < total) {
      await sleep(250);
    }
  }

  return { migrated, failed };
}

async function main(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   MongoDB → Convex Migration                 ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  console.log("📦  Connecting to MongoDB…");
  const mongoClient = new MongoClient(MONGODB_URI!);
  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB_NAME);
  console.log(`    ✔  Connected to database: "${MONGODB_DB_NAME}"\n`);

  console.log("⚡  Initialising Convex client…");
  const convex = new ConvexHttpClient(CONVEX_URL!);
  console.log(`    ✔  Deployment: ${CONVEX_URL}\n`);

  const summary = {
    users: { found: 0, migrated: 0, failed: 0, skipped: 0 },
    history: { found: 0, migrated: 0, failed: 0, skipped: 0, missingUsers: 0 },
  };

  try {
    console.log("👤  Fetching users from MongoDB…");
    const mongoUsers = await db.collection<MongoUser>("users").find({}).toArray();

    summary.users.found = mongoUsers.length;
    console.log(`    Found ${mongoUsers.length} user(s).\n`);

    const mongoToAuthUserId = new Map<string, string>();

    if (mongoUsers.length > 0) {
      console.log("    Inserting into Better Auth user/account tables...");

      const convexUsers = mongoUsers.map((user) => ({
        name: user.name ?? "Unknown",
        email: user.email,
        passwordHash: user.password ?? "",
        mongoId: user._id.toHexString(),
        createdAt: toTimestamp(user.createdAt),
        updatedAt: toTimestamp(user.updatedAt),
      }));

      for (let i = 0; i < convexUsers.length; i += BATCH_SIZE) {
        const batch = convexUsers.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (user) => {
            try {
              const result = (await convex.mutation(
                upsertMigratedUserMutation,
                user,
              )) as MigratedUserResult;
              mongoToAuthUserId.set(user.mongoId, result.userId);
              summary.users.migrated++;
            } catch (err) {
              summary.users.failed++;
              console.warn(
                "  ⚠️  Skipped one users item:",
                (err as Error).message,
              );
            }
          }),
        );

        const done = Math.min(i + BATCH_SIZE, convexUsers.length);
        const pct = Math.round((done / convexUsers.length) * 100);
        console.log(`     users: ${done}/${convexUsers.length}  (${pct}%)`);

        if (done < convexUsers.length) {
          await sleep(250);
        }
      }

      console.log(
        `\n    ✅  Users migrated: ${summary.users.migrated}/${mongoUsers.length}` +
          (summary.users.failed > 0
            ? `  (${summary.users.failed} failed)`
            : "") +
          "\n",
      );
    }

    console.log("🎵  Fetching audio_history from MongoDB…");
    const mongoHistory = await db
      .collection<MongoAudioHistory>("audio_history")
      .find({})
      .toArray();

    summary.history.found = mongoHistory.length;
    console.log(`    Found ${mongoHistory.length} history item(s).\n`);

    if (mongoHistory.length > 0) {
      const validItems = mongoHistory.filter((item) =>
        VALID_SERVICES.has(item.service as ServiceType),
      );
      const invalidItems = mongoHistory.filter(
        (item) => !VALID_SERVICES.has(item.service as ServiceType),
      );

      summary.history.skipped = invalidItems.length;

      if (invalidItems.length > 0) {
        console.warn(
          `    ⚠️  Skipping ${invalidItems.length} item(s) with unrecognised service type:`,
        );
        const unknownServices = [...new Set(invalidItems.map((h) => h.service))];
        console.warn(`        ${unknownServices.join(", ")}\n`);
      }

      const mappedItems = validItems.flatMap((item) => {
        const authUserId = mongoToAuthUserId.get(item.userId);

        if (!authUserId) {
          summary.history.missingUsers++;
          return [];
        }

        return [
          {
            title: item.title ?? "Untitled",
            voice: item.voice ?? null,
            audioUrl: item.audioUrl ?? null,
            time: item.time ?? new Date().toLocaleTimeString(),
            date: item.date ?? new Date().toLocaleDateString(),
            service: item.service as ServiceType,
            userId: authUserId,
            blobName: item.blobName,
            mongoId: item._id.toHexString(),
            createdAt: toTimestamp(item.createdAt),
            updatedAt: toTimestamp(item.updatedAt),
          },
        ];
      });

      if (summary.history.missingUsers > 0) {
        console.warn(
          `    ⚠️  Skipping ${summary.history.missingUsers} item(s) with no migrated user mapping.\n`,
        );
      }

      console.log(
        `    Inserting ${mappedItems.length} valid item(s) into Convex…`,
      );

      const result = await insertInBatches(
        convex,
        upsertMigratedAudioHistoryMutation,
        mappedItems,
        "audioHistory",
      );

      summary.history.migrated = result.migrated;
      summary.history.failed = result.failed;

      console.log(
        `\n    ✅  History migrated: ${result.migrated}/${mappedItems.length}` +
          (result.failed > 0 ? `  (${result.failed} failed)` : "") +
          "\n",
      );
    }

    console.log("╔══════════════════════════════════════════════╗");
    console.log("║   Migration Summary                          ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(
      `║  Users    found:    ${String(summary.users.found).padEnd(24)}║`,
    );
    console.log(
      `║  Users    migrated: ${String(summary.users.migrated).padEnd(24)}║`,
    );
    console.log(
      `║  Users    failed:   ${String(summary.users.failed).padEnd(24)}║`,
    );
    console.log("║──────────────────────────────────────────────║");
    console.log(
      `║  History  found:    ${String(summary.history.found).padEnd(24)}║`,
    );
    console.log(
      `║  History  migrated: ${String(summary.history.migrated).padEnd(24)}║`,
    );
    console.log(
      `║  History  skipped:  ${String(summary.history.skipped).padEnd(24)}║`,
    );
    console.log(
      `║  History  no user:  ${String(summary.history.missingUsers).padEnd(24)}║`,
    );
    console.log(
      `║  History  failed:   ${String(summary.history.failed).padEnd(24)}║`,
    );
    console.log("╚══════════════════════════════════════════════╝\n");

    const totalFailed = summary.users.failed + summary.history.failed;

    if (totalFailed > 0) {
      console.warn(
        `⚠️  Migration completed with ${totalFailed} failure(s). Re-run the script to retry failed items.\n`,
      );
    } else {
      console.log("🎉  Migration complete — all records transferred successfully!\n");
    }
  } finally {
    await mongoClient.close();
    console.log("🔒  MongoDB connection closed.\n");
  }
}

main().catch((err: unknown) => {
  console.error("💥  Migration failed:", err);
  process.exit(1);
});
