import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Scalar } from "@scalar/hono-api-reference";
import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import { auth } from "@my-better-t-app/auth";
import { env } from "@my-better-t-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from 'hono/secure-headers'
const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    maxAge: 600,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);

  // Clone the response to add CORS headers
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
  headers.set("Access-Control-Allow-Credentials", "true");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

// oRPC handler
const rpcHandler = new RPCHandler(appRouter);

// oRPC endpoints
app.use("/api/*", async (c, next) => {
  const context = await createContext({ context: c });

  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/api",
    context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// OpenAPI spec endpoint
app.get("/doc", async (c) => {
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const spec = await generator.generate(appRouter, {
    info: {
      title: "My Better T-App API",
      version: "1.0.0",
      description: "API documentation for My Better T-App e-commerce platform",
    },
    servers: [
      {
        url: env.CORS_ORIGIN || "http://localhost:3000",
        description: "API Server",
      },
    ],
  });

  return c.json(spec);
});

// Scalar API documentation
app.get(
  "/scalar",
  Scalar({
    url: "/doc",
    theme: "purple",
    pageTitle: "My Better T-App API Documentation",
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;

