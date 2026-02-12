import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_S3_PUBLIC_URL: z.string().url().optional(),
    VITE_SENTRY_DSN: z.string().url().optional(),
    VITE_LOGTAIL_SOURCE_TOKEN: z.string().min(1).optional(),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
