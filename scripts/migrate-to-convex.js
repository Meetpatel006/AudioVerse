"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var dotenv = __toESM(require("dotenv"), 1);
var import_mongodb = require("mongodb");
var import_browser = require("convex/browser");
var import_server = require("convex/server");
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "elevenlabs";
const CONVEX_URL = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
if (!MONGODB_URI) {
  throw new Error("\u274C  MONGODB_URI is not set in .env / .env.local");
}
if (!CONVEX_URL) {
  throw new Error("\u274C  CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) is not set");
}
const migrationsApi = import_server.anyApi.migrations;
const audioHistoryApi = import_server.anyApi.audioHistory;
const upsertMigratedUserMutation = migrationsApi.upsertMigratedUser;
const upsertMigratedAudioHistoryMutation = audioHistoryApi.upsertMigratedAudioHistoryItem;
const VALID_SERVICES = /* @__PURE__ */ new Set([
  "styletts2",
  "seedvc",
  "make-an-audio",
  "melody-maker",
  "lyrics-to-music"
]);
const BATCH_SIZE = 50;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function toTimestamp(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.getTime();
  }
  return Date.now();
}
async function insertInBatches(convex, mutationRef, items, label) {
  let migrated = 0;
  let failed = 0;
  const total = items.length;
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        try {
          await convex.mutation(
            mutationRef,
            item
          );
          migrated++;
        } catch (err) {
          failed++;
          console.warn(
            `  \u26A0\uFE0F  Skipped one ${label} item:`,
            err.message
          );
        }
      })
    );
    const done = Math.min(i + BATCH_SIZE, total);
    const pct = Math.round(done / total * 100);
    console.log(`     ${label}: ${done}/${total}  (${pct}%)`);
    if (done < total) {
      await sleep(250);
    }
  }
  return { migrated, failed };
}
async function main() {
  console.log("\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
  console.log("\u2551   MongoDB \u2192 Convex Migration                 \u2551");
  console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n");
  console.log("\u{1F4E6}  Connecting to MongoDB\u2026");
  const mongoClient = new import_mongodb.MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB_NAME);
  console.log(`    \u2714  Connected to database: "${MONGODB_DB_NAME}"
`);
  console.log("\u26A1  Initialising Convex client\u2026");
  const convex = new import_browser.ConvexHttpClient(CONVEX_URL);
  console.log(`    \u2714  Deployment: ${CONVEX_URL}
`);
  const summary = {
    users: { found: 0, migrated: 0, failed: 0, skipped: 0 },
    history: { found: 0, migrated: 0, failed: 0, skipped: 0, missingUsers: 0 }
  };
  try {
    console.log("\u{1F464}  Fetching users from MongoDB\u2026");
    const mongoUsers = await db.collection("users").find({}).toArray();
    summary.users.found = mongoUsers.length;
    console.log(`    Found ${mongoUsers.length} user(s).
`);
    const mongoToAuthUserId = /* @__PURE__ */ new Map();
    if (mongoUsers.length > 0) {
      console.log("    Inserting into Better Auth user/account tables...");
      const convexUsers = mongoUsers.map((user) => ({
        name: user.name ?? "Unknown",
        email: user.email,
        passwordHash: user.password ?? "",
        mongoId: user._id.toHexString(),
        createdAt: toTimestamp(user.createdAt),
        updatedAt: toTimestamp(user.updatedAt)
      }));
      for (let i = 0; i < convexUsers.length; i += BATCH_SIZE) {
        const batch = convexUsers.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (user) => {
            try {
              const result = await convex.mutation(
                upsertMigratedUserMutation,
                user
              );
              mongoToAuthUserId.set(user.mongoId, result.userId);
              summary.users.migrated++;
            } catch (err) {
              summary.users.failed++;
              console.warn(
                "  \u26A0\uFE0F  Skipped one users item:",
                err.message
              );
            }
          })
        );
        const done = Math.min(i + BATCH_SIZE, convexUsers.length);
        const pct = Math.round(done / convexUsers.length * 100);
        console.log(`     users: ${done}/${convexUsers.length}  (${pct}%)`);
        if (done < convexUsers.length) {
          await sleep(250);
        }
      }
      console.log(
        `
    \u2705  Users migrated: ${summary.users.migrated}/${mongoUsers.length}` + (summary.users.failed > 0 ? `  (${summary.users.failed} failed)` : "") + "\n"
      );
    }
    console.log("\u{1F3B5}  Fetching audio_history from MongoDB\u2026");
    const mongoHistory = await db.collection("audio_history").find({}).toArray();
    summary.history.found = mongoHistory.length;
    console.log(`    Found ${mongoHistory.length} history item(s).
`);
    if (mongoHistory.length > 0) {
      const validItems = mongoHistory.filter(
        (item) => VALID_SERVICES.has(item.service)
      );
      const invalidItems = mongoHistory.filter(
        (item) => !VALID_SERVICES.has(item.service)
      );
      summary.history.skipped = invalidItems.length;
      if (invalidItems.length > 0) {
        console.warn(
          `    \u26A0\uFE0F  Skipping ${invalidItems.length} item(s) with unrecognised service type:`
        );
        const unknownServices = [...new Set(invalidItems.map((h) => h.service))];
        console.warn(`        ${unknownServices.join(", ")}
`);
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
            time: item.time ?? (/* @__PURE__ */ new Date()).toLocaleTimeString(),
            date: item.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString(),
            service: item.service,
            userId: authUserId,
            blobName: item.blobName,
            mongoId: item._id.toHexString(),
            createdAt: toTimestamp(item.createdAt),
            updatedAt: toTimestamp(item.updatedAt)
          }
        ];
      });
      if (summary.history.missingUsers > 0) {
        console.warn(
          `    \u26A0\uFE0F  Skipping ${summary.history.missingUsers} item(s) with no migrated user mapping.
`
        );
      }
      console.log(
        `    Inserting ${mappedItems.length} valid item(s) into Convex\u2026`
      );
      const result = await insertInBatches(
        convex,
        upsertMigratedAudioHistoryMutation,
        mappedItems,
        "audioHistory"
      );
      summary.history.migrated = result.migrated;
      summary.history.failed = result.failed;
      console.log(
        `
    \u2705  History migrated: ${result.migrated}/${mappedItems.length}` + (result.failed > 0 ? `  (${result.failed} failed)` : "") + "\n"
      );
    }
    console.log("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
    console.log("\u2551   Migration Summary                          \u2551");
    console.log("\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563");
    console.log(
      `\u2551  Users    found:    ${String(summary.users.found).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  Users    migrated: ${String(summary.users.migrated).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  Users    failed:   ${String(summary.users.failed).padEnd(24)}\u2551`
    );
    console.log("\u2551\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2551");
    console.log(
      `\u2551  History  found:    ${String(summary.history.found).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  History  migrated: ${String(summary.history.migrated).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  History  skipped:  ${String(summary.history.skipped).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  History  no user:  ${String(summary.history.missingUsers).padEnd(24)}\u2551`
    );
    console.log(
      `\u2551  History  failed:   ${String(summary.history.failed).padEnd(24)}\u2551`
    );
    console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n");
    const totalFailed = summary.users.failed + summary.history.failed;
    if (totalFailed > 0) {
      console.warn(
        `\u26A0\uFE0F  Migration completed with ${totalFailed} failure(s). Re-run the script to retry failed items.
`
      );
    } else {
      console.log("\u{1F389}  Migration complete \u2014 all records transferred successfully!\n");
    }
  } finally {
    await mongoClient.close();
    console.log("\u{1F512}  MongoDB connection closed.\n");
  }
}
main().catch((err) => {
  console.error("\u{1F4A5}  Migration failed:", err);
  process.exit(1);
});
