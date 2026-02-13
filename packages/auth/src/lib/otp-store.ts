// Simple in-memory OTP store
// In production, replace with a shared store (Redis or database)

interface OTPData {
  otp: string
  email: string
  createdAt: number
  attempts: number
}

const otpStore = new Map<string, OTPData>()

// Note: These mirror the better-auth emailOTP plugin defaults used for sign-in,
// but this store is for the custom email-change flow which bypasses the plugin.
const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 3

const assertNotProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'In-memory OTP storage is not allowed in production. Configure a shared store (Redis or database).',
    )
  }
}

export function storeOTP(
  email: string,
  otp: string,
): {
  success: boolean
} {
  assertNotProduction()
  console.log(`[OTP STORE] Storing OTP for ${email}`)

  otpStore.set(email.toLowerCase(), {
    otp,
    email,
    createdAt: Date.now(),
    attempts: 0,
  })

  return { success: true }
}

export function verifyOTP(
  email: string,
  providedOTP: string,
): {
  valid: boolean
  error?: string
} {
  assertNotProduction()
  const normalizedEmail = email.toLowerCase()
  const data = otpStore.get(normalizedEmail)

  console.log(`[OTP STORE] Verifying OTP for ${email}`)

  if (!data) {
    console.log(`[OTP STORE] No OTP found for ${email}`)
    return { valid: false, error: 'No OTP found. Please request a new code.' }
  }

  // Check expiry
  const now = Date.now()
  if (now - data.createdAt > OTP_EXPIRY_MS) {
    console.log(`[OTP STORE] OTP expired for ${email}`)
    otpStore.delete(normalizedEmail)
    return {
      valid: false,
      error: 'OTP has expired. Please request a new code.',
    }
  }

  // Check attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    console.log(`[OTP STORE] Too many attempts for ${email}`)
    otpStore.delete(normalizedEmail)
    return {
      valid: false,
      error: 'Too many failed attempts. Please request a new code.',
    }
  }

  // Verify OTP
  if (data.otp !== providedOTP) {
    data.attempts++
    console.log(
      `[OTP STORE] Invalid OTP for ${email}. Attempts: ${data.attempts}/${MAX_ATTEMPTS}`,
    )

    if (data.attempts >= MAX_ATTEMPTS) {
      console.log(`[OTP STORE] Too many attempts for ${email}`)
      otpStore.delete(normalizedEmail)
      return {
        valid: false,
        error: 'Too many failed attempts. Please request a new code.',
      }
    }

    return {
      valid: false,
      error: `Invalid code. ${MAX_ATTEMPTS - data.attempts} attempts remaining.`,
    }
  }

  // Success - remove from store
  console.log(`[OTP STORE] OTP verified successfully for ${email}`)
  otpStore.delete(normalizedEmail)
  return { valid: true }
}

export function cleanupExpiredOTPs(): void {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (now - data.createdAt > OTP_EXPIRY_MS) {
      otpStore.delete(email)
    }
  }
}
