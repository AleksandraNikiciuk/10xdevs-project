import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user has valid recovery session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const data = await response.json();

        if (data.authenticated) {
          setIsValidSession(true);
        } else {
          setApiError("Invalid or expired reset link. Please request a new password reset.");
        }
      } catch {
        setApiError("Failed to verify session. Please try again.");
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    const validationResult = resetPasswordSchema.safeParse({ ...formData, [id]: value });
    if (!validationResult.success) {
      setErrors(validationResult.error);
    } else {
      setErrors(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    const validationResult = resetPasswordSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
      setIsSubmitting(false);
      return;
    }

    try {
      // Get Supabase config from meta tags
      const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute("content");
      const supabaseAnonKey = document.querySelector('meta[name="supabase-anon-key"]')?.getAttribute("content");

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration not found");
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setApiError(error.message);
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to login
      window.location.href = "/login?message=Password updated successfully. Please log in with your new password.";
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to reset password");
      setIsSubmitting(false);
    }
  };

  const fieldErrors = useMemo(() => {
    return errors?.flatten().fieldErrors;
  }, [errors]);

  const isFormInvalid = !formData.password || !formData.confirmPassword || errors !== null;

  if (isCheckingSession) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Verifying your session...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isValidSession) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Session expired or invalid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{apiError}</p>
          <div className="mt-4">
            <a href="/forgot-password" className="text-sm text-primary underline">
              Request a new password reset link
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm" data-test-id="reset-password-form-card">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="contents" data-test-id="reset-password-form">
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              aria-describedby="password-error"
              data-test-id="reset-password-input"
              placeholder="At least 8 characters"
            />
            {fieldErrors?.password && (
              <p id="password-error" className="text-sm text-red-600" data-test-id="reset-password-error">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              aria-describedby="confirm-password-error"
              data-test-id="reset-confirm-password-input"
              placeholder="Re-enter your password"
            />
            {fieldErrors?.confirmPassword && (
              <p
                id="confirm-password-error"
                className="text-sm text-red-600"
                data-test-id="reset-confirm-password-error"
              >
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-4">
          <Button
            className="w-full"
            type="submit"
            disabled={isFormInvalid || isSubmitting}
            data-test-id="reset-password-submit-button"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
          {apiError && (
            <p
              id="form-error"
              className="mt-2 text-sm text-red-600"
              aria-live="assertive"
              data-test-id="reset-password-api-error"
            >
              {apiError}
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            <a href="/login" className="underline" data-test-id="reset-password-back-to-login">
              Back to login
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
