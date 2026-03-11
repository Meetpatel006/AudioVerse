import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

const serviceValidator = v.union(
  v.literal("styletts2"),
  v.literal("seedvc"),
  v.literal("make-an-audio"),
  v.literal("melody-maker"),
  v.literal("lyrics-to-music"),
);

export const createAudioHistoryItem = mutation({
  args: {
    title:     v.string(),
    voice:     v.union(v.string(), v.null()),
    audioUrl:  v.union(v.string(), v.null()),
    time:      v.string(),
    date:      v.string(),
    service:   serviceValidator,
    userId:    v.string(),
    blobName:  v.optional(v.string()),
    mongoId:   v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => ctx.db.insert("audioHistory", args),
});

export const upsertMigratedAudioHistoryItem = mutation({
  args: {
    title:     v.string(),
    voice:     v.union(v.string(), v.null()),
    audioUrl:  v.union(v.string(), v.null()),
    time:      v.string(),
    date:      v.string(),
    service:   serviceValidator,
    userId:    v.string(),
    blobName:  v.optional(v.string()),
    mongoId:   v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("audioHistory")
      .withIndex("by_mongoId", (q) => q.eq("mongoId", args.mongoId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("audioHistory", args);
  },
});

// ── getMyHistory ───────────────────────────────────────────────────────────────
// Authenticated query — resolves userId from Better Auth session
export const getMyHistory = query({
  args: { service: serviceValidator },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];
    const userId = String(user._id);
    return ctx.db
      .query("audioHistory")
      .withIndex("by_userId_service", (q) =>
        q.eq("userId", userId).eq("service", args.service),
      )
      .order("desc")
      .collect();
  },
});

// ── getMyAllHistory ────────────────────────────────────────────────────────────
// Authenticated query — all history for the current user across all services
export const getMyAllHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];
    const userId = String(user._id);
    return ctx.db
      .query("audioHistory")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── getHistoryByUserAndService ─────────────────────────────────────────────────
// Server-side / migration use — explicit userId passed in
export const getHistoryByUserAndService = query({
  args: { userId: v.string(), service: serviceValidator },
  handler: async (ctx, args) =>
    ctx.db
      .query("audioHistory")
      .withIndex("by_userId_service", (q) =>
        q.eq("userId", args.userId).eq("service", args.service),
      )
      .order("desc")
      .collect(),
});

// ── deleteMyHistoryItem ────────────────────────────────────────────────────────
// Authenticated mutation — verifies ownership via Better Auth session
export const deleteMyHistoryItem = mutation({
  args: { id: v.id("audioHistory") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const userId = String(user._id);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return { blobName: item.blobName ?? null };
  },
});

// ── deleteHistoryItemWithAuth ──────────────────────────────────────────────────
// Server-side deletion — verifies ownership with explicit userId (for API routes)
export const deleteHistoryItemWithAuth = mutation({
  args: { id: v.id("audioHistory"), userId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return { blobName: item.blobName ?? null };
  },
});

// ── deleteHistoryItemsByUser ───────────────────────────────────────────────────
// Bulk delete — used for account cleanup or migration rollback
export const deleteHistoryItemsByUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("audioHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    return items.length;
  },
});
