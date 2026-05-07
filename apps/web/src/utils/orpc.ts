import { env } from '@my-better-t-app/env/web'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { AppRouter } from '@my-better-t-app/api/routers/index'

const getServerUrl = () => {
  if (env.VITE_SERVER_URL) return env.VITE_SERVER_URL
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:3000'
}

// Create oRPC client
const link = new RPCLink({
  url: `${getServerUrl()}/api`,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // For cookies/session
    })
  },
})

export const orpcClient = createORPCClient<AppRouter>(link)

// Create TanStack Query utils
export const orpc = createTanstackQueryUtils(orpcClient) as any
