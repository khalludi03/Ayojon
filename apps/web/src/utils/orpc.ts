import type { AppRouter } from "@my-better-t-app/api/routers/index";
import type { RouterClient } from "@orpc/server";
import { env } from "@my-better-t-app/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Create oRPC client
const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/api`,
  fetch: (request, init) => {
    return fetch(request, {
      ...init,
      credentials: "include", // For cookies/session
    });
  },
});

export const orpcClient = createORPCClient<RouterClient<AppRouter>>(link);

// Create TanStack Query utils
export const orpc = createTanstackQueryUtils(orpcClient);
