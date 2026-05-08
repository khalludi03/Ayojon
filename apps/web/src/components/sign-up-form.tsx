import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'
import { Eye, EyeOff } from 'lucide-react'

import { useEffect, useState } from 'react'
import { env } from '@my-better-t-app/env/web'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

// Password strength indicator (copied from reset-password-form)
function PasswordStrength({ password }: { password: string }) {
  function calculateStrength(pass: string) {
    let score = 0
    if (!pass) return 0
    if (pass.length > 8) score += 1
    if (/[a-z]/.test(pass)) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1
    return score
  }
  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  const score = calculateStrength(password)
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-full flex-1 rounded-full transition-colors',
              score >= level ? getStrengthColor(score) : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {score <= 2 ? 'Weak' : score <= 3 ? 'Medium' : 'Strong'}
      </p>
    </div>
  )
}

const SIGNUP_PENDING_KEY = 'ayojon-signup-pending'

export default function SignUpForm({
  onSwitchToSignIn,
  onSuccess,
}: {
  onSwitchToSignIn: () => void
  onSuccess?: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: '',
  })

  // Restore OTP dialog if user switched tabs during verification
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SIGNUP_PENDING_KEY)
      if (stored) {
        const data = JSON.parse(stored) as {
          email: string
          password: string
          name: string
        }
        setSignupData(data)
        setShowOTPDialog(true)
      }
    } catch {
      sessionStorage.removeItem(SIGNUP_PENDING_KEY)
    }
  }, [])

  const clearPendingSignup = () => {
    sessionStorage.removeItem(SIGNUP_PENDING_KEY)
  }

  const navigate = useNavigate({
    from: '/',
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // First, send OTP
        const response = await fetch(
          `${env.VITE_SERVER_URL}/api/signup/send-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: value.email }),
          },
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send verification code')
        }

        // Store signup data for later use (persisted so tab-switch doesn't lose it)
        const pending = {
          email: value.email,
          password: value.password,
          name: value.name,
        }
        sessionStorage.setItem(SIGNUP_PENDING_KEY, JSON.stringify(pending))
        setSignupData(pending)

        setShowOTPDialog(true)
        toast.success(`Verification code sent to ${value.email}`)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to start sign up',
        )
      }
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, 'Name must be at least 2 characters'),
          email: z.string().email('Invalid email address'),
          password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[a-z]/, 'Password must contain a lowercase letter')
            .regex(/[A-Z]/, 'Password must contain an uppercase letter')
            .regex(/[0-9]/, 'Password must contain a number')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        }),
    },
  })

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsVerifyingOTP(true)
    try {
      const response = await fetch(
        `${env.VITE_SERVER_URL}/api/signup/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: signupData.email,
            otp,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        // If it was the 3rd attempt, the server returns a specific error
        if (result.error?.includes('Too many failed attempts')) {
          clearPendingSignup()
          setShowOTPDialog(false)
          setOtp('')
          toast.error(
            'Account creation unsuccessful: Too many failed OTP attempts. Please try signing up again.',
          )
          return
        }
        throw new Error(result.error || 'Invalid verification code')
      }

      // OTP verified, now create the account
      await authClient.signUp.email(
        {
          email: signupData.email,
          password: signupData.password,
          name: signupData.name,
        },
        {
          onSuccess: () => {
            clearPendingSignup()
            setShowOTPDialog(false)
            if (onSuccess) {
              onSuccess()
              toast.success('Sign up successful')
            } else {
              navigate({
                to: '/',
              })
              toast.success('Sign up successful')
            }
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
          },
        },
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify code',
      )
    } finally {
      setIsVerifyingOTP(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      const response = await fetch(
        `${env.VITE_SERVER_URL}/api/signup/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: signupData.email }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend code')
      }

      toast.success(`Verification code resent to ${signupData.email}`)
      setOtp('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend code',
      )
    }
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <PasswordStrength password={field.state.value} />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Confirm Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? 'Submitting...' : 'Sign Up'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="mt-4 w-full"
        onClick={async () => {
          await authClient.signIn.social(
            {
              provider: 'google',
              callbackURL: window.location.origin + '/',
            },
            {
              // Force Google to show account picker
              prompt: 'select_account',
            },
          )
        }}
      >
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
        Sign up with Google
      </Button>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Already have an account? Sign In
        </Button>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog
        open={showOTPDialog}
        onOpenChange={(open) => {
          if (!open && !isVerifyingOTP) {
            clearPendingSignup()
            setShowOTPDialog(false)
            setOtp('')
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to{' '}
              <strong>{signupData.email}</strong>. Please enter it below to
              complete your registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                The code will expire in 5 minutes
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isVerifyingOTP}
            >
              Resend Code
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={() => {
                  clearPendingSignup()
                  setShowOTPDialog(false)
                  setOtp('')
                }}
                disabled={isVerifyingOTP}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
                className="flex-1"
              >
                {isVerifyingOTP ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
