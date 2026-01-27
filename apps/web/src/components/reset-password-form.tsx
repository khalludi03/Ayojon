import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { buttonVariants, Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function PasswordStrength({ password }: { password: string }) {
  const strength = calculateStrength(password);
  
  function calculateStrength(pass: string) {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
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
              score >= level ? getStrengthColor(score) : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {score <= 2 ? "Weak" : score <= 3 ? "Medium" : "Strong"}
      </p>
    </div>
  );
}

export default function ResetPasswordForm({ token, error: tokenError }: { token?: string; error?: string }) {
  const navigate = useNavigate();
  
  if (tokenError === "invalid_token") {
     return (
      <div className="mx-auto w-full mt-10 max-w-md p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold text-red-600">Invalid or Expired Link</h1>
        <p className="text-muted-foreground mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link to="/forgot-password" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
          Request New Link
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
       <div className="mx-auto w-full mt-10 max-w-md p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold text-red-600">Missing Token</h1>
        <p className="text-muted-foreground mb-6">
          The password reset link is missing the token. Please check the link and try again.
        </p>
        <Link to="/login" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
          Return to Login
        </Link>
      </div>
    );
  }

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successful");
            navigate({ to: "/login" });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-2 text-center text-3xl font-bold">Reset Password</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Enter your new password below.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>New Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
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
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
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

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
