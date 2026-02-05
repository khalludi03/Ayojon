import { db } from "@my-better-t-app/db";
import * as schema from "@my-better-t-app/db/schema/auth";
import { env } from "@my-better-t-app/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendPasswordResetEmail } from "./lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await sendPasswordResetEmail({
            to: user.email,
            userName: user.name,
            resetUrl: url,
          });
          console.log(`Password reset email sent to ${user.email}`);
          return;
        } catch (error) {
          console.error(
            `Password reset email attempt ${attempt}/${maxAttempts} failed:`,
            error,
          );
          if (attempt === maxAttempts) throw error;
          await new Promise((res) => setTimeout(res, 1000 * attempt));
        }
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [],
});
