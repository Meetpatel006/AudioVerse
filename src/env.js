import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string().optional(),
    DATABASE_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    BACKEND_API_KEY: z.string().optional(),
    STYLETTS2_API_ROUTE: z.string().optional(),
    SEED_VC_API_ROUTE: z.string().optional(),
    MAKE_AN_AUDIO_API_ROUTE: z.string().optional(),
    AZURE_STORAGE_ACCOUNT_NAME: z.string().optional(),
    AZURE_STORAGE_KEY: z.string().optional(),
    AZURE_CONTAINER_NAME: z.string().optional(),
    AZURE_BLOB_ENDPOINT: z.string().optional(),
    APPWRITE_PROJECT_ID: z.string().optional(),
    APPWRITE_API_KEY: z.string().optional(),
    APPWRITE_ENDPOINT: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    BACKEND_API_KEY: process.env.BACKEND_API_KEY,
    STYLETTS2_API_ROUTE: process.env.STYLETTS2_API_ROUTE,
    SEED_VC_API_ROUTE: process.env.SEED_VC_API_ROUTE,
    MAKE_AN_AUDIO_API_ROUTE: process.env.MAKE_AN_AUDIO_API_ROUTE,
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY,
    AZURE_CONTAINER_NAME: process.env.AZURE_CONTAINER_NAME,
    AZURE_BLOB_ENDPOINT: process.env.AZURE_BLOB_ENDPOINT,
    APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
  },
  /**
   * Run 
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
}); 