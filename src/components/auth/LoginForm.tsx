import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { z } from "zod";
import { loginSchema } from "@/lib/schemas/auth.schema";

type FormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    const validationResult = loginSchema.safeParse({ ...formData, [id]: value });
    if (!validationResult.success) {
      setErrors(validationResult.error);
    } else {
      setErrors(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
      return;
    }

    const formPayload = new FormData();
    formPayload.append("email", formData.email);
    formPayload.append("password", formData.password);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formPayload,
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        setApiError(errorData.error || "An unknown error occurred.");
      }
    } catch {
      setApiError("Failed to connect to the server.");
    }
  };

  const fieldErrors = useMemo(() => {
    return errors?.flatten().fieldErrors;
  }, [errors]);

  const isFormInvalid = !formData.email || !formData.password || errors !== null;

  return (
    <Card className="w-full max-w-sm" data-test-id="login-form-card">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="contents" data-test-id="login-form">
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              aria-describedby="email-error"
              data-test-id="login-email-input"
            />
            {fieldErrors?.email && (
              <p id="email-error" className="text-sm text-red-600" data-test-id="login-email-error">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              aria-describedby="password-error"
              data-test-id="login-password-input"
            />
            {fieldErrors?.password && (
              <p id="password-error" className="text-sm text-red-600" data-test-id="login-password-error">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-4">
          <Button className="w-full" type="submit" disabled={isFormInvalid} data-test-id="login-submit-button">
            Sign in
          </Button>
          {apiError && (
            <p
              id="form-error"
              className="mt-2 text-sm text-red-600"
              aria-live="assertive"
              data-test-id="login-api-error"
            >
              {apiError}
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            <a href="/forgot-password" className="underline" data-test-id="login-forgot-password-link">
              Forgot password?
            </a>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline" data-test-id="login-signup-link">
              Sign up
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
