import { db } from '@my-better-t-app/db'
import * as schema from '@my-better-t-app/db/schema/auth'
import { env } from '@my-better-t-app/env/server'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { sendOTPEmail, sendPasswordResetEmail } from './lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',

    schema: schema,
  }),
  user: {
    additionalFields: {
      phoneNumber: { type: 'string' },
      dateOfBirth: { type: 'date' },
      gender: { type: 'string' },
      isDeactivated: { type: 'boolean', defaultValue: false },
      deactivatedAt: { type: 'date' },
      retentionUntil: { type: 'date' },
      deactivationReason: { type: 'string' },
      deactivationFeedback: { type: 'string' },
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: true,
      },
      vendorStatus: {
        type: 'string',
        defaultValue: 'none',
        required: true,
      },
    },
  },
  hooks: {
    session: {
      async beforeCreate(session) {
        // Reactivate deactivated users on successful login
        const user = session.user
        if (user?.isDeactivated) {
          await db
            .update(schema.user)
            .set({
              isDeactivated: false,
              deactivatedAt: null,
              retentionUntil: null,
              deactivationReason: null,
              deactivationFeedback: null,
              updatedAt: new Date(),
            })
            .where(eq(schema.user.id, user.id))
        }
        return { session }
      },
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          userName: user.name,
          resetUrl: url,
        })
        console.log(`Password reset email sent to ${user.email}`)
      } catch (error) {
        console.error('Failed to send password reset email:', error)
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
  emailVerification: {
    sendOnSignUp: false,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail({
            to: email,
            otp,
            type,
          })
        } catch (error) {
          console.error('Failed to send OTP email:', error)
          throw error
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
    }),
  ],
})
