import { env } from "@my-better-t-app/env/server";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

interface SendPasswordResetEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
}

interface SendOTPEmailParams {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return randomInt(100000, 1000000).toString();
}

export async function sendOTPEmail({
  to,
  otp,
  type,
}: SendOTPEmailParams) {
  const typeText = {
    "sign-in": "Sign In",
    "email-verification": "Email Verification",
    "forget-password": "Password Reset",
  }[type];

  try {
    const info = await transporter.sendMail({
      from: `"My Better T App" <${env.EMAIL_USER}>`,
      to,
      subject: `Your ${typeText} Code`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${typeText} Code</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px;">
                        <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #18181b;">
                          ${typeText} Code
                        </h1>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #52525b;">
                          Your verification code is:
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <div style="display: inline-block; padding: 20px 40px; background-color: #f4f4f5; border: 2px dashed #4f46e5; border-radius: 8px;">
                                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace;">
                                  ${otp}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #71717a;">
                          This code will expire in 5 minutes for security reasons.
                        </p>
                        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #71717a;">
                          If you didn't request this code, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
                          Best regards,<br>
                          My Better T App Team
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="padding: 0 40px;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                          This is an automated email. Please do not reply to this message.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: SendPasswordResetEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"My Better T App" <${env.EMAIL_USER}>`,
      to,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px;">
                        <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #18181b;">
                          Reset Your Password
                        </h1>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #52525b;">
                          Hi ${userName || "there"},
                        </p>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #52525b;">
                          We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${resetUrl}"
                                 style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #71717a;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #4f46e5; word-break: break-all;">
                          ${resetUrl}
                        </p>
                        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #71717a;">
                          This link will expire in 1 hour for security reasons.
                        </p>
                        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #71717a;">
                          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
                          Best regards,<br>
                          My Better T App Team
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="padding: 0 40px;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                          This is an automated email. Please do not reply to this message.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}