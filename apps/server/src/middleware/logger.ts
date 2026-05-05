import type { Context, Next } from "hono";
import { logger } from "../lib/logger";

export const customLogger = async (c: Context, next: Next) => {
  const { method, url } = c.req;
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  const status = c.res.status;

  if (status >= 500) {
    logger.error(`[${status}] ${method} ${url} - ${ms}ms`);
  } else if (status >= 400) {
    logger.warn(`[${status}] ${method} ${url} - ${ms}ms`);
  } else {
    logger.info(`[${status}] ${method} ${url} - ${ms}ms`);
  }
};
