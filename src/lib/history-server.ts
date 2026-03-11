import type { ServiceType } from "~/types/services";
import { blobServiceClient } from "./azure-storage";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ClientHistoryItem {
  id: string;
  title: string;
  voice: string | null;
  audioUrl: string | null;
  time: string;
  date: string;
  service: ServiceType;
  userId: string;
  blobName?: string;
  createdAt: string;
  updatedAt: string;
}

type NewHistoryItem = {
  title: string;
  voice: string | null;
  audioUrl: string | null;
  time: string;
  date: string;
  service: ServiceType;
  userId: string;
  blobName?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME ?? "works";
const audioHistoryApi = anyApi.audioHistory!;

function getConvex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

// ── getHistoryItems ────────────────────────────────────────────────────────────

export async function getHistoryItems(
  userId: string,
  service: ServiceType,
): Promise<ClientHistoryItem[]> {
  try {
    const convex = getConvex();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await convex.query(
      audioHistoryApi.getHistoryByUserAndService as any,
      {
        userId,
        service,
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (items as any[]).map((item) => ({
      id: item._id as string,
      title: item.title as string,
      voice: item.voice as string | null,
      audioUrl: item.audioUrl as string | null,
      time: item.time as string,
      date: item.date as string,
      service: item.service as ServiceType,
      userId: item.userId as string,
      blobName: item.blobName as string | undefined,
      createdAt: new Date(item.createdAt as number).toISOString(),
      updatedAt: new Date(item.updatedAt as number).toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch history items:", error);
    return [];
  }
}

// ── addHistoryItem ─────────────────────────────────────────────────────────────

export async function addHistoryItem(
  item: NewHistoryItem,
): Promise<string | null> {
  try {
    const convex = getConvex();

    // Ensure Azure container exists if there is an audio URL
    if (item.audioUrl) {
      try {
        const containerClient =
          blobServiceClient.getContainerClient(CONTAINER_NAME);
        await containerClient.createIfNotExists();
      } catch {
        // Continue even if blob storage setup fails
      }
    }

    const now = Date.now();

    const id = await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioHistoryApi.createAudioHistoryItem as any,
      {
        title: item.title ?? "Untitled",
        voice: item.voice ?? null,
        audioUrl: item.audioUrl ?? null,
        time: item.time,
        date: item.date,
        service: item.service,
        userId: item.userId,
        blobName: item.blobName,
        createdAt: now,
        updatedAt: now,
      },
    );

    return id as string;
  } catch (error) {
    console.error("Failed to add history item:", error);
    return null;
  }
}

// ── deleteHistoryItem ──────────────────────────────────────────────────────────

export async function deleteHistoryItem(
  itemId: string,
  userId: string,
): Promise<boolean> {
  try {
    const convex = getConvex();

    const result = await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioHistoryApi.deleteHistoryItemWithAuth as any,
      { id: itemId, userId },
    );

    // Delete the associated Azure blob if one exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blobName = (result as any)?.blobName as string | null | undefined;
    if (blobName) {
      try {
        const containerClient =
          blobServiceClient.getContainerClient(CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      } catch {
        // Continue even if blob deletion fails
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to delete history item:", error);
    return false;
  }
}
