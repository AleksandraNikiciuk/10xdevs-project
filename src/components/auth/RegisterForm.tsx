import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { z } from "zod";
import { registerSchema } from "@/lib/schemas/auth.schema";

type FormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const newFormData = { ...formData, [id]: value };
    setFormData(newFormData);

    const validationResult = registerSchema.safeParse(newFormData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
    } else {
      setErrors(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const validationResult = registerSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
      return;
    }

    const formPayload = new FormData();
    formPayload.append("email", formData.email);
    formPayload.append("password", formData.password);
    formPayload.append("confirmPassword", formData.confirmPassword);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formPayload,
      });

      const responseData = await response.json();
      if (response.ok) {
        setSuccessMessage(responseData.message);
        setFormData({ email: "", password: "", confirmPassword: "" });
        setErrors(null);
      } else {
        setApiError(responseData.error || "An unknown error occurred.");
      }
    } catch {
      setApiError("Failed to connect to the server.");
    }
  };

  const fieldErrors = useMemo(() => {
    return errors?.flatten().fieldErrors;
  }, [errors]);

  const isFormInvalid = !formData.email || !formData.password || !formData.confirmPassword || errors !== null;

  return (
    <Card className="w-full max-w-sm" data-test-id="register-form-card">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="contents" data-test-id="register-form">
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
              data-test-id="register-email-input"
            />
            {fieldErrors?.email && (
              <p className="text-sm text-red-600" data-test-id="register-email-error">
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
              data-test-id="register-password-input"
            />
            {fieldErrors?.password && (
              <p className="text-sm text-red-600" data-test-id="register-password-error">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              data-test-id="register-confirm-password-input"
            />
            {fieldErrors?.confirmPassword && (
              <p className="text-sm text-red-600" data-test-id="register-confirm-password-error">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button className="w-full" type="submit" disabled={isFormInvalid} data-test-id="register-submit-button">
            Create account
          </Button>
          {apiError && (
            <p className="mt-2 text-sm text-red-600" data-test-id="register-api-error">
              {apiError}
            </p>
          )}
          {successMessage && (
            <p className="mt-2 text-sm text-green-600" data-test-id="register-success-message">
              {successMessage}
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="underline" data-test-id="register-signin-link">
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
