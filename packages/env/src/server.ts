import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    FACEBOOK_CLIENT_ID: z.string().min(1),
    FACEBOOK_CLIENT_SECRET: z.string().min(1),
    CORS_ORIGIN: z.url(),
    // RESEND_API_KEY: z.string().min(1),
    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number().int().positive(),
    EMAIL_USER: z.string().min(1),
    EMAIL_PASSWORD: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_ENDPOINT: z.string().url(),
    S3_BUCKET: z.string().min(1),
    S3_PUBLIC_URL: z.string().url().optional(),
    SENTRY_DSN: z.string().url().optional(),
    LOGTAIL_SOURCE_TOKEN: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
