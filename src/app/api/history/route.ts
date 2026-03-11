import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthQuery, fetchAuthMutation } from "~/lib/auth-server";
import { blobServiceClient } from "~/lib/azure-storage";
import type { ServiceType } from "~/types/services";

const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME ?? "works";

// Lazily import the generated api to avoid issues before `npx convex dev` runs
async function getApi() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("@convex/_generated/api")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return mod.api;
}

// ── GET /api/history?service=<ServiceType> ─────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (!service) {
      return NextResponse.json(
        { error: "service query parameter is required" },
        { status: 400 },
      );
    }

    const api = await getApi();

    // Verify session and fetch history in one authenticated call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const user = await fetchAuthQuery(api.auth.getCurrentUser);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const historyItems = await fetchAuthQuery(api.audioHistory.getMyHistory, {
      service: service as ServiceType,
    });

    return NextResponse.json(historyItems ?? []);
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history items" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/history?id=<convexId> ─────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 },
      );
    }

    const api = await getApi();

    // deleteMyHistoryItem verifies ownership via Better Auth session internally
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const result = await fetchAuthMutation(
      api.audioHistory.deleteMyHistoryItem,
      {
        id,
      },
    );

    // Clean up associated Azure blob if one exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blobName = (result as any)?.blobName as string | null | undefined;
    if (blobName) {
      try {
        const containerClient =
          blobServiceClient.getContainerClient(CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      } catch {
        // Don't fail the request if blob deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 },
    );
  }
}
