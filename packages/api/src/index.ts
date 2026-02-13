import { ORPCError, os } from '@orpc/server'

import type { Context } from './context'

// Protected procedure (requires auth)
import type { user } from '@my-better-t-app/db/schema/auth'

export { os }

// Base procedure with context
export const baseProcedure = os.$context<Context>()

// Public procedure (no auth required)
export const publicProcedure = baseProcedure

type SessionUser = typeof user.$inferSelect

export const protectedProcedure = baseProcedure.use(
  async ({ context, next }) => {
    if (!context.session) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Authentication required',
      })
    }

    const sessionUser = context.session.user as SessionUser
    if (sessionUser.isDeactivated) {
      throw new ORPCError('FORBIDDEN', {
        message:
          'Your account is deactivated. Please log in again to reactivate.',
      })
    }

    return next({
      context: {
        ...context,
        session: context.session,
      },
    })
  },
)

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const sessionUser = context.session.user as SessionUser
    if (sessionUser.role !== 'admin') {
      throw new ORPCError('FORBIDDEN', {
        message: 'Admin access required',
      })
    }

    return next()
  },
)
