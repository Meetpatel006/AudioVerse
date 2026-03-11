import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

export const upsertMigratedUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    mongoId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existingUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });

    let userId: string;

    if (existingUser) {
      userId = String(existingUser._id);

      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: userId }],
          update: {
            name: args.name || (existingUser.name as string),
            userId: args.mongoId,
            updatedAt: Math.max(
              args.updatedAt,
              Number(existingUser.updatedAt ?? 0),
            ),
          },
        },
      });
    } else {
      const createdUser = await ctx.runMutation(components.betterAuth.adapter.create, {
        input: {
          model: "user",
          data: {
            name: args.name,
            email,
            emailVerified: false,
            image: null,
            createdAt: args.createdAt,
            updatedAt: args.updatedAt,
            userId: args.mongoId,
          },
        },
      });

      userId = String(createdUser._id);
    }

    const credentialAccount = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "account",
        where: [
          { field: "providerId", value: "credential" },
          { field: "userId", value: userId },
        ],
      },
    );

    if (credentialAccount) {
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "account",
          where: [{ field: "_id", value: String(credentialAccount._id) }],
          update: {
            accountId:
              (credentialAccount.accountId as string | undefined) ?? userId,
            password: args.passwordHash,
            updatedAt: Math.max(
              args.updatedAt,
              Number(credentialAccount.updatedAt ?? 0),
            ),
          },
        },
      });
    } else {
      await ctx.runMutation(components.betterAuth.adapter.create, {
        input: {
          model: "account",
          data: {
            accountId: userId,
            providerId: "credential",
            userId,
            password: args.passwordHash,
            createdAt: args.createdAt,
            updatedAt: args.updatedAt,
          },
        },
      });
    }

    return {
      userId,
      email,
      mongoId: args.mongoId,
    };
  },
});

export const getMigratedUserByMongoId = query({
  args: { mongoId: v.string() },
  handler: async (ctx, args) => {
    return ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", value: args.mongoId }],
    });
  },
});
