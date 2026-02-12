import type { Context, Next } from "hono";
import { db } from "@my-better-t-app/db";
import { rateLimit } from "@my-better-t-app/db/schema/auth";
import { eq, lt } from "drizzle-orm";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator: (c: Context) => string | Promise<string>;
  message?: string;
  skip?: (c: Context) => boolean | Promise<boolean>;
}

/**
 * Brute-force protection middleware using database for persistence.
 * Suitable for environments where in-memory stores are cleared on redeploy/restart.
 */
export const rateLimiter = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    if (options.skip && (await options.skip(c))) {
      return await next();
    }

    const key = await options.keyGenerator(c);
    const now = new Date();

    // Occasional cleanup of expired entries (1% chance per request)
    if (Math.random() < 0.01) {
      // Run cleanup in background
      db.delete(rateLimit).where(lt(rateLimit.expiresAt, now)).execute().catch(err => {
        console.error("[RateLimit] Cleanup failed:", err);
      });
    }

    try {
      const record = await db.query.rateLimit.findFirst({
        where: eq(rateLimit.key, key),
      });

      if (record) {
        if (record.expiresAt < now) {
          // Reset if expired
          await db
            .update(rateLimit)
            .set({
              count: 1,
              lastAttempt: now,
              expiresAt: new Date(now.getTime() + options.windowMs),
            })
            .where(eq(rateLimit.key, key));
        } else {
          if (record.count >= options.max) {
            const retryAfter = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000);
            c.header("Retry-After", retryAfter.toString());
            return c.json(
              {
                error: options.message || "Too many requests. Please try again later.",
                retryAfterSeconds: retryAfter,
              },
              429,
            );
          }

          await db
            .update(rateLimit)
            .set({
              count: record.count + 1,
              lastAttempt: now,
            })
            .where(eq(rateLimit.key, key));
        }
      } else {
        await db.insert(rateLimit).values({
          key,
          count: 1,
          lastAttempt: now,
          expiresAt: new Date(now.getTime() + options.windowMs),
        });
      }
    } catch (error) {
      console.error("[RateLimit] Database error:", error);
      // Fail open to avoid blocking users if DB is down, but log it
    }

    await next();
  };
};

/**
 * Helper to get client IP from Hono context
 */
export const getClientIp = (c: Context): string => {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0] ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
};
