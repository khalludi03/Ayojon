import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

function PasswordStrength({ password }: { password: string }) {
  function calculateStrength(pass: string) {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  }
  const getStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };
  const score = calculateStrength(password);
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-full flex-1 rounded-full transition-colors",
              score >= level ? getStrengthColor(score) : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-right uppercase tracking-wider font-medium">
        {score <= 2 ? "Weak" : score <= 3 ? "Medium" : "Strong"}
      </p>
    </div>
  );
}

export function ChangePasswordForm({ userEmail }: { userEmail?: string }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const navigate = useNavigate();

  const checkAccount = async () => {
    setIsLoadingAccount(true);
    try {
      // Force refresh session to get latest account data
      const { data: sessionData, error: sessionError } = await authClient.getSession({
        fetchOptions: {
          cache: 'no-store',
          credentials: 'include'
        }
      });

      if (sessionError || !sessionData) {
        console.warn("No active session found during account check");
        setHasPassword(null);
        setIsLoadingAccount(false);
        return;
      }

      const { data, error } = await authClient.listAccounts({
        fetchOptions: {
          cache: 'no-store',
          credentials: 'include'
        }
      });

      if (error) {
        // If 401, it might be a temporary issue or specific protection
        // We'll fallback to assuming they have a password to show the form
        // rather than stuck in loading or showing 'set password' UI incorrectly
        console.error("Error fetching accounts:", error);
        if (error.status === 401) {
          setHasPassword(true);
          return;
        }
        throw error;
      }

      console.log("Accounts data:", data); // Debug log

      // Check if there is a 'credential' account
      // Better-auth stores the provider type in the 'provider' field
      // which corresponds to 'providerId' in the database
      const hasCredential = data?.some(acc =>
        acc.provider === "credential" || acc.providerId === "credential"
      );
      console.log("Has credential account:", hasCredential); // Debug log

      setHasPassword(!!hasCredential);
    } catch (err) {
      console.error("Error checking account type:", err);
      // Fallback to true to show the form if check fails
      setHasPassword(true);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  useEffect(() => {
    checkAccount();
  }, [userEmail]); // Re-check when userEmail changes (after password reset)

  // Re-check when page becomes visible (after returning from password reset)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAccount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        if (error.status === 401 || error.message?.toLowerCase().includes("current password")) {
          toast.error("Current password is incorrect");
        } else {
          toast.error(error.message || "Failed to update password");
        }
        return;
      }

      toast.success("Password updated successfully");
      
      // Auto logout and require re-login
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: "/login" });
          }
        }
      });
    },
    validators: {
      onSubmit: z
        .object({
          currentPassword: z.string().min(1, "Current password is required"),
          newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Password must contain a lowercase letter")
            .regex(/[A-Z]/, "Password must contain an uppercase letter")
            .regex(/[0-9]/, "Password must contain a number")
            .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  if (isLoadingAccount) {
    return (
      <Card className="border-shadow shadow-sm animate-pulse">
        <div className="h-64 bg-muted/20 rounded-xl" />
      </Card>
    );
  }

  if (hasPassword === false) {
    return (
      <Card className="border-shadow shadow-sm overflow-hidden border-amber-100 dark:border-amber-900/30">
        <CardHeader className="space-y-1.5 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl">Set Account Password</CardTitle>
          </div>
          <CardDescription className="text-sm">
            You are currently signed in via a social provider and haven't set a password for this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            To enable password-based login alongside your social account, you need to set a password.
            Since you don't have an existing password to "change", we'll guide you through our secure reset flow.
          </p>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4 border border-amber-100 dark:border-amber-900/20 space-y-2">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              We'll send a secure link to <span className="font-bold">{userEmail}</span> to set your new password.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Important:</strong> After setting your password, you must sign in using your email and password (not via Google) for the changes to take effect.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/30 px-6 py-5 flex flex-wrap gap-2">
          <Button
            className="flex-1 sm:flex-none"
            asChild
          >
            <Link to="/forgot-password">
              Reset Password
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={checkAccount}
            disabled={isLoadingAccount}
            className="flex-1 sm:flex-none"
          >
            {isLoadingAccount ? "Checking..." : "Already Set Password?"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-shadow shadow-sm overflow-hidden">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Change Password</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <form
          id="change-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-6"
        >
          {/* Hidden username field for password managers to know which account is being updated */}
          {userEmail && (
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={userEmail}
              readOnly
              className="sr-only"
              aria-hidden="true"
            />
          )}

          <form.Field name="currentPassword">
            {(field) => (
              <div className="space-y-2.5">
                <Label htmlFor={field.name} className="text-sm font-semibold">Current Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showCurrentPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter current password"
                    className="pr-11 h-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-[13px] text-destructive font-medium mt-1.5">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <div className="h-px bg-border/50 my-2" />

          <form.Field name="newPassword">
            {(field) => (
              <div className="space-y-2.5">
                <Label htmlFor={field.name} className="text-sm font-semibold">New Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showNewPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-11 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={field.state.value} />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-[13px] text-destructive font-medium mt-1.5">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-2.5">
                <Label htmlFor={field.name} className="text-sm font-semibold">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-11 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-[13px] text-destructive font-medium mt-1.5">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </form>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-5 flex justify-end">
        <form.Subscribe>
          {(state) => (
            <Button
              form="change-password-form"
              type="submit"
              disabled={!state.canSubmit || state.isSubmitting}
              className="min-w-[140px]"
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          )}
        </form.Subscribe>
      </CardFooter>
    </Card>
  );
}
