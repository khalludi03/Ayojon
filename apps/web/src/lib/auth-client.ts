import { env } from "@my-better-t-app/env/web";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  user: {
    additionalFields: {
      phoneNumber: { type: "string" },
      dateOfBirth: { type: "date" },
      gender: { type: "string" },
      role: { type: "string" },
      vendorStatus: { type: "string" },
    },
  },
  plugins: [emailOTPClient()],
});