
import { auth } from '@my-better-t-app/auth'
import * as storage from '@my-better-t-app/storage'
import type { Context as HonoContext } from 'hono'

export type CreateContextOptions = {
  context: HonoContext
}

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })
  return {
    session,
    storage,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
