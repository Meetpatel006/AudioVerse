import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  audioHistory: defineTable({
    title:     v.string(),
    voice:     v.union(v.string(), v.null()),
    audioUrl:  v.union(v.string(), v.null()),
    time:      v.string(),
    date:      v.string(),
    service:   v.union(
      v.literal("styletts2"),
      v.literal("seedvc"),
      v.literal("make-an-audio"),
      v.literal("melody-maker"),
      v.literal("lyrics-to-music"),
    ),
    userId:    v.string(),
    blobName:  v.optional(v.string()),
    mongoId:   v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId",         ["userId"])
    .index("by_userId_service", ["userId", "service"])
    .index("by_mongoId",        ["mongoId"]),
});
