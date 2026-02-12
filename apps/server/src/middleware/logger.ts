import { Context, Next } from "hono";
import { Logtail } from "@logtail/node";
import { env } from "@my-better-t-app/env/server";

const logtail = env.LOGTAIL_SOURCE_TOKEN ? new Logtail(env.LOGTAIL_SOURCE_TOKEN) : null;

export const customLogger = async (c: Context, next: Next) => {
  const { method, url } = c.req;
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  const status = c.res.status;

  const logData = {
    method,
    url,
    status,
    duration: `${ms}ms`,
    ip: c.req.header("x-forwarded-for") || "unknown",
    userAgent: c.req.header("user-agent"),
  };

  if (logtail) {
    if (status >= 500) {
      logtail.error(`[${status}] ${method} ${url}`, logData);
    } else if (status >= 400) {
      logtail.warn(`[${status}] ${method} ${url}`, logData);
    } else {
      logtail.info(`[${status}] ${method} ${url}`, logData);
    }
  } else {
    // Fallback to console if Logtail is not configured
    console.log(`[Hono] ${status} ${method} ${url} - ${ms}ms`);
  }
};
