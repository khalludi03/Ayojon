import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VendorFormData } from '@/types/vendor';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountStepProps {
  formData: VendorFormData;
  onFormChange: (field: keyof VendorFormData, value: string) => void;
  onNext: () => void;
  onAccountCreation: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; userId?: string }>;
}

export function AccountStep({ formData, onFormChange, onNext, onAccountCreation }: AccountStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create account with better-auth
      setIsCreatingAccount(true);

      const result = await onAccountCreation(
        formData.email,
        formData.password,
        formData.email.split('@')[0] // Use email prefix as initial name
      );

      setIsCreatingAccount(false);

      if (result.success) {
        // Account created successfully, proceed to next step
        onNext();
      } else {
        // Show error
        setErrors({
          email: result.error || 'Failed to create account. Please try again.',
        });
      }
    }
  };

  const passwordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStatus = formData.password ? passwordStrength(formData.password) : null;

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
                onFormChange('email', e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="vendor@example.com"
              className={cn(
                'pl-10',
                errors.email && 'border-red-500 focus-visible:ring-red-500'
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
                onFormChange('password', e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Create a strong password"
              className={cn(
                'pl-10 pr-10',
                errors.password && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  className={cn('h-full rounded-full transition-all', passwordStatus.color)}
                  style={{ width: `${passwordStatus.strength}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Password strength: <span className="font-medium">{passwordStatus.label}</span>
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
                onFormChange('confirmPassword', e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Re-enter your password"
              className={cn(
                'pl-10 pr-10',
                errors.confirmPassword && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            disabled={isCreatingAccount}
          >
            {isCreatingAccount ? (
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
    </div>
  );
}
