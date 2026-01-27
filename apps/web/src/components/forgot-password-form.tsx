import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import { buttonVariants, Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: window.location.origin + "/reset-password",
        },
        {
          onSuccess: () => {
            setIsSubmitted(true);
            toast.success("Reset link sent");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full mt-10 max-w-md p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          We have sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
        </p>
        <Link to="/login" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-2 text-center text-3xl font-bold">Forgot Password</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Enter your email address and we will send you a link to reset your password.
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
                  placeholder="name@example.com"
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
              {state.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Link
          to="/login"
          className={cn(buttonVariants({ variant: "link" }), "text-indigo-600 hover:text-indigo-800")}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
