import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Scalar } from "@scalar/hono-api-reference";
import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import { auth } from "@my-better-t-app/auth";
import { generateOTP, sendOTPEmail } from "@my-better-t-app/auth/lib/email";
import { storeOTP, verifyOTP } from "@my-better-t-app/auth/lib/otp-store";
import { db } from "@my-better-t-app/db";
import { user as userTable, account as accountTable } from "@my-better-t-app/db/schema/auth";
import { env } from "@my-better-t-app/env/server";
import { and, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
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

// Custom email change OTP endpoints
app.post("/api/email-change/send-otp", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.email, email), ne(userTable.id, session.user.id)))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: "Email is already in use" }, 409);
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with rate limiting
    const storeResult = storeOTP(email, otp);
    if (!storeResult.success) {
      return c.json(
        {
          error: storeResult.error || "Too many OTP requests. Please try again later.",
          retryAfterSeconds: storeResult.retryAfterSeconds,
        },
        429,
      );
    }

    // Send email
    await sendOTPEmail({
      to: email,
      otp,
      type: "email-verification",
    });

    return c.json({
      success: true,
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return c.json(
      { error: "Failed to send verification code" },
      500
    );
  }
});

app.post("/api/email-change/verify-otp", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user?.id) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const body = await c.req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return c.json({ error: "Email and OTP are required" }, 400);
    }

    const userId = session.user.id;

    const result = verifyOTP(email, otp);

    if (!result.valid) {
      return c.json({ error: result.error }, 400);
    }

    // Ensure email is still available
    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.email, email), ne(userTable.id, userId)))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: "Email is already in use" }, 409);
    }

    // Update the user's email directly in the database
    try {
      // Update user email
      await db
        .update(userTable)
        .set({
          email,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, userId));

      // CRITICAL: Update credential account's providerId
      // This ensures old email cannot be used for login
      await db
        .update(accountTable)
        .set({
          providerId: email,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(accountTable.userId, userId),
            eq(accountTable.accountId, "credential")
          )
        );

      // CRITICAL: Unlink OAuth accounts (Google, Facebook, etc.)
      // OAuth providers send their own email during login, which could
      // overwrite the manually-changed email. Unlinking forces users to
      // re-authenticate with OAuth if they want to use it again.
      await db
        .delete(accountTable)
        .where(
          and(
            eq(accountTable.userId, userId),
            ne(accountTable.accountId, "credential")
          )
        );
    } catch (updateError) {
      console.error("Error updating email:", updateError);
      // Since the OTP has already been consumed by verifyOTP,
      // issue a new OTP so the user can retry the email change.
      try {
        const newOtp = generateOTP();
        const storeResult = storeOTP(email, newOtp);
        if (!storeResult.success) {
          return c.json({ error: "Failed to update email" }, 500);
        }

        await sendOTPEmail({
          to: email,
          otp: newOtp,
          type: "email-verification",
        });

        return c.json(
          {
            error: "Failed to update email. A new verification code has been sent.",
            // Only include OTP in development for testing
            ...(process.env.NODE_ENV !== "production" && { otp: newOtp }),
          },
          500,
        );
      } catch (resendError) {
        console.error("Error sending replacement OTP after email update failure:", resendError);
        return c.json({ error: "Failed to update email" }, 500);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return c.json({ error: "Failed to verify code" }, 500);
  }
});

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
    return response;
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

