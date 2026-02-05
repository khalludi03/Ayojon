import type { AppRouter } from "@my-better-t-app/api/routers/index";
import { env } from "@my-better-t-app/env/web";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Create oRPC client
export const orpcClient = createORPCClient<AppRouter>({
  baseURL: `${env.VITE_SERVER_URL}/api`,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include", // For cookies/session
    });
  },
});

// Create TanStack Query utils
export const orpc = createTanstackQueryUtils(orpcClient);
