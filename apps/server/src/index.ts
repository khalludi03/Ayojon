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
import { session as sessionTable } from "@my-better-t-app/db/schema/auth";
import { orders } from "@my-better-t-app/db/schema/orders";
import { env } from "@my-better-t-app/env/server";
import { and, eq, ne, notInArray } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { rateLimiter, getClientIp } from "./middleware/rate-limit";

const app = new Hono();

app.use(logger());

// Rate limiters
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 mins per IP
  keyGenerator: (c) => `auth:${getClientIp(c)}`,
  message: "Too many authentication attempts. Please try again later.",
});

const otpLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 mins
  keyGenerator: async (c) => {
    try {
      const cloned = c.req.raw.clone();
      const body = (await cloned.json()) as { email?: string };
      if (body.email) return `otp:${body.email.toLowerCase()}`;
    } catch (e) {
      // Fallback to IP if body can't be parsed
    }
    return `otp:${getClientIp(c)}`;
  },
  message: "Too many OTP requests. Please try again later.",
});

app.onError((err, c) => {
  // Always log full error details server-side for debugging
  console.error(`[Hono Error] ${c.req.method} ${c.req.url}:`, err);

  // In production, return generic error to avoid leaking internal details
  // (SQL errors, stack traces, file paths, etc.)
  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = isProduction
    ? "Internal Server Error"
    : err.message || "Internal Server Error";

  return c.json({ error: errorMessage }, 500);
});

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 600,
  }),
);

// Custom email change OTP endpoints
app.post("/api/email-change/send-otp", otpLimiter, async (c) => {
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

    // Store OTP (Rate limiting now handled by middleware)
    storeOTP(email, otp);

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

// Signup OTP endpoints
app.post("/api/signup/send-otp", otpLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    // Check if user already exists
    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: "Email is already in use" }, 409);
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP (Rate limiting now handled by middleware)
    storeOTP(email, otp);

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
    console.error("Error sending signup OTP:", error);
    return c.json(
      { error: "Failed to send verification code" },
      500
    );
  }
});

app.post("/api/signup/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return c.json({ error: "Email and OTP are required" }, 400);
    }

    const result = verifyOTP(email, otp);

    if (!result.valid) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error verifying signup OTP:", error);
    return c.json({ error: "Failed to verify code" }, 500);
  }
});

// Deactivate account endpoint
app.post("/api/account/deactivate", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user?.id) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const body = await c.req.json();
    const { reason, feedback } = body;

    if (!reason) {
      return c.json({ error: "Deactivation reason is required" }, 400);
    }

    const userId = session.user.id;

    // Check for pending orders
    const pendingOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          notInArray(orders.status, ["delivered", "cancelled"])
        )
      )
      .limit(1);

    if (pendingOrders.length > 0) {
      return c.json(
        { error: "Cannot deactivate account with pending orders. Please wait for orders to be delivered or cancel them." },
        409
      );
    }

    // Deactivate user
    const now = new Date();
    const retentionUntil = new Date(now);
    retentionUntil.setDate(retentionUntil.getDate() + 90);

    await db
      .update(userTable)
      .set({
        isDeactivated: true,
        deactivatedAt: now,
        retentionUntil,
        deactivationReason: reason,
        deactivationFeedback: feedback || null,
        updatedAt: now,
      })
      .where(eq(userTable.id, userId));

    // Logout user by invalidating all sessions
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, userId));

    return c.json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return c.json({ error: "Failed to deactivate account" }, 500);
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

app.on(["POST", "GET"], "/api/auth/*", authLimiter, async (c) => {
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
  // Debug logging only in development to avoid log volume and sensitive URL exposure
  if (process.env.NODE_ENV !== "production") {
    console.log(`[oRPC Debug] Incoming: ${c.req.method} ${c.req.url}`);
  }

  const context = await createContext({ context: c });

  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/api",
    context,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[oRPC Debug] Matched: ${matched}, Status: ${response?.status}`);
  }

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

