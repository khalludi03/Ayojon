import { useState, useEffect } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react'
import { env } from '@my-better-t-app/env/web'
import { toast } from 'sonner'
import type { VendorFormData } from '@/types/vendor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const VENDOR_SIGNUP_PENDING_KEY = 'ayojon-vendor-signup-pending'

interface AccountStepProps {
  formData: VendorFormData
  onFormChange: (field: keyof VendorFormData, value: string) => void
  onNext: () => void
}

export function AccountStep({
  formData,
  onFormChange,
  onNext,
}: AccountStepProps) {
  const { data: session } = authClient.useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  // OTP States
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)

  const clearPendingSignup = () => {
    sessionStorage.removeItem(VENDOR_SIGNUP_PENDING_KEY)
  }

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(VENDOR_SIGNUP_PENDING_KEY)
      if (stored) {
        const data = JSON.parse(stored) as {
          email: string
          password: string
          businessName: string
        }
        onFormChange('email', data.email)
        onFormChange('password', data.password)
        if (data.businessName) onFormChange('businessName', data.businessName)
        setShowOTPDialog(true)
      }
    } catch {
      sessionStorage.removeItem(VENDOR_SIGNUP_PENDING_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If already logged in, show a different UI
  if (session?.user) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Already Logged In
          </h2>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            You are currently logged in as{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {session.user.email}
            </span>
            . We'll use this account for your vendor registration.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={onNext} size="lg" className="w-full">
            Continue as {session.user.name || 'User'} →
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.signOut()
              window.location.reload()
            }}
            className="w-full"
          >
            Use a different account
          </Button>
        </div>
      </div>
    )
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

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
            email: formData.email,
            otp,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        if (result.error?.includes('Too many failed attempts')) {
          clearPendingSignup()
          setShowOTPDialog(false)
          setOtp('')
          toast.error(
            'Verification unsuccessful: Too many failed OTP attempts. Please try again later.',
          )
          return
        }
        throw new Error(result.error || 'Invalid verification code')
      }

      // OTP verified, now create the account
      setIsCreatingAccount(true)
      await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.businessName || formData.email.split('@')[0],
        },
        {
          onSuccess: () => {
            clearPendingSignup()
            setShowOTPDialog(false)
            toast.success('Account created and email verified!')
            onNext()
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
            setIsCreatingAccount(false)
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
          body: JSON.stringify({ email: formData.email }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend code')
      }

      toast.success(`Verification code resent to ${formData.email}`)
      setOtp('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend code',
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // Send OTP first
      setIsSendingOTP(true)
      try {
        const response = await fetch(
          `${env.VITE_SERVER_URL}/api/signup/send-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email }),
          },
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send verification code')
        }

        sessionStorage.setItem(
          VENDOR_SIGNUP_PENDING_KEY,
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            businessName: formData.businessName || '',
          }),
        )
        setShowOTPDialog(true)
        toast.success(`Verification code sent to ${formData.email}`)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to start account creation',
        )
      } finally {
        setIsSendingOTP(false)
      }
    }
  }

  const passwordStrength = (
    password: string,
  ): { strength: number; label: string; color: string } => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++

    if (strength <= 2)
      return { strength: 33, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 4)
      return { strength: 66, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 100, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStatus = formData.password
    ? passwordStrength(formData.password)
    : null

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Create Your Account
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Enter your email and create a secure password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                onFormChange('email', e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              placeholder="vendor@example.com"
              className={cn(
                'pl-10',
                errors.email && 'border-red-500 focus-visible:ring-red-500',
              )}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                onFormChange('password', e.target.value)
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: '' }))
              }}
              placeholder="Create a strong password"
              className={cn(
                'pl-10 pr-10',
                errors.password && 'border-red-500 focus-visible:ring-red-500',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.password}</span>
            </div>
          )}
          {/* Password Strength Indicator */}
          {formData.password && passwordStatus && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    passwordStatus.color,
                  )}
                  style={{ width: `${passwordStatus.strength}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Password strength:{' '}
                <span className="font-medium">{passwordStatus.label}</span>
              </p>
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Must be at least 8 characters
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => {
                onFormChange('confirmPassword', e.target.value)
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              placeholder="Re-enter your password"
              className={cn(
                'pl-10 pr-10',
                errors.confirmPassword &&
                  'border-red-500 focus-visible:ring-red-500',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
          {formData.confirmPassword &&
            formData.password === formData.confirmPassword &&
            !errors.confirmPassword && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Passwords match</span>
              </div>
            )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="min-w-[120px]"
            disabled={isSendingOTP || isCreatingAccount}
          >
            {isSendingOTP ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending Code...
              </>
            ) : isCreatingAccount ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating Account...
              </>
            ) : (
              'Next →'
            )}
          </Button>
        </div>
      </form>

      {/* OTP Verification Dialog */}
      <Dialog
        open={showOTPDialog}
        onOpenChange={(open) => {
          if (!open && !isVerifyingOTP && !isCreatingAccount) {
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
              <strong>{formData.email}</strong>. Please enter it below to verify
              your email and create your account.
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
              disabled={isVerifyingOTP || isCreatingAccount}
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
                disabled={isVerifyingOTP || isCreatingAccount}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={
                  isVerifyingOTP || isCreatingAccount || otp.length !== 6
                }
                className="flex-1"
              >
                {isVerifyingOTP || isCreatingAccount
                  ? 'Processing...'
                  : 'Verify & Create'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
