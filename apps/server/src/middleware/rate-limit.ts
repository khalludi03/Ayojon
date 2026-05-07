import { db } from '@my-better-t-app/db'
import { rateLimit } from '@my-better-t-app/db/schema/auth'
import { eq, lt, sql } from 'drizzle-orm'
import type { Context, Next } from 'hono'

export interface RateLimitOptions {
  windowMs: number
  max: number
  keyGenerator: (c: Context) => string | Promise<string>
  message?: string
  skip?: (c: Context) => boolean | Promise<boolean>
}

/**
 * Brute-force protection middleware using database for persistence.
 * Suitable for environments where in-memory stores are cleared on redeploy/restart.
 */
export const rateLimiter = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    if (options.skip && (await options.skip(c))) {
      return await next()
    }

    const key = await options.keyGenerator(c)
    const now = new Date()

    // Occasional cleanup of expired entries (1% chance per request)
    if (Math.random() < 0.01) {
      // Run cleanup in background
      db.delete(rateLimit)
        .where(lt(rateLimit.expiresAt, now))
        .execute()
        .catch((err) => {
          console.error('[RateLimit] Cleanup failed:', err)
        })
    }

    try {
      const expiresAt = new Date(now.getTime() + options.windowMs)

      // Atomic upsert: reset if expired, increment otherwise
      const result = await db
        .insert(rateLimit)
        .values({ key, count: 1, lastAttempt: now, expiresAt })
        .onConflictDoUpdate({
          target: rateLimit.key,
          set: {
            count: sql`CASE WHEN ${rateLimit.expiresAt} < ${now} THEN 1 ELSE ${rateLimit.count} + 1 END`,
            lastAttempt: now,
            expiresAt: sql`CASE WHEN ${rateLimit.expiresAt} < ${now} THEN ${expiresAt} ELSE ${rateLimit.expiresAt} END`,
          },
        })
        .returning()

      const record = result[0]
      if (record && record.count > options.max) {
        const retryAfter = Math.ceil(
          (record.expiresAt.getTime() - now.getTime()) / 1000,
        )
        c.header('Retry-After', retryAfter.toString())
        return c.json(
          {
            error:
              options.message || 'Too many requests. Please try again later.',
            retryAfterSeconds: retryAfter,
          },
          429,
        )
      }
    } catch (error) {
      console.error('[RateLimit] Database error:', error)
      // Fail open to avoid blocking users if DB is down
    }

    await next()
  }
}

/**
 * Helper to get client IP from Hono context
 */
export const getClientIp = (c: Context): string => {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0] ||
    c.req.header('x-real-ip') ||
    'unknown'
  )
}
