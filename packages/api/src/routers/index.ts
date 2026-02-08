import { z } from "zod";
import { protectedProcedure, publicProcedure, os } from "../index";
import { storageRouter } from "./storage";
import { vendorRouter } from "./vendor";
import { vendorProductRouter } from "./product";

export const appRouter = os.router({
  ...storageRouter,
  ...vendorRouter,
  ...vendorProductRouter,
  healthCheck: publicProcedure
    .route({
      method: "GET",
      path: "/health",
      operationId: "healthCheck",
      summary: "Health Check",
      description: "Check if the API server is running and responding to requests",
      tags: ["System"],
      successStatus: 200,
    })
    .output(z.string().describe("Health status message"))
    .handler(async () => {
      return "OK";
    }),
  privateData: protectedProcedure
    .route({
      method: "GET",
      path: "/private",
      operationId: "getPrivateData",
      summary: "Get Private User Data",
      description:
        "Fetch private user data for the authenticated user. Requires a valid session cookie.",
      tags: ["User", "Authentication"],
      successStatus: 200,
    })
    .output(
      z.object({
        message: z.string().describe("A private message for the user"),
        user: z
          .object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
          })
          .describe("The authenticated user's information"),
      }),
    )
    .handler(async ({ context }) => {
      return {
        message: "This is private",
        user: context.session.user,
      };
    }),
});

export type AppRouter = typeof appRouter;
