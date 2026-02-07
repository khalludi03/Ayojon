import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

// Base procedure with context
export const baseProcedure = os.$context<Context>();

// Public procedure (no auth required)
export const publicProcedure = baseProcedure;

// Protected procedure (requires auth)
export const protectedProcedure = baseProcedure.use(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  // Block deactivated users from accessing protected routes
  const user = context.session.user as any;
  if (user?.isDeactivated) {
    throw new ORPCError("FORBIDDEN", {
      message: "Your account is deactivated. Please log in again to reactivate.",
    });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});
