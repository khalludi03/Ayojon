import type { AppRouter } from "@my-better-t-app/api/routers/index";
import { env } from "@my-better-t-app/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Create oRPC client
const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/api`,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include", // For cookies/session
    });
  },
});

export const orpcClient = createORPCClient<AppRouter>(link);

// Create TanStack Query utils
export const orpc = createTanstackQueryUtils(orpcClient) as any;
