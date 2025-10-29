import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/schemas/auth.schema";

type FormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<FormData>({ email: "" });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    const validationResult = forgotPasswordSchema.safeParse({ ...formData, [id]: value });
    if (!validationResult.success) {
      setErrors(validationResult.error);
    } else {
      setErrors(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setApiMessage(null);

    const validationResult = forgotPasswordSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
      return;
    }

    const formPayload = new FormData();
    formPayload.append("email", formData.email);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      if (response.ok) {
        setApiMessage(data.message);
      } else {
        setApiError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setApiError("Failed to connect to the server.");
    }
  };

  const fieldErrors = useMemo(() => {
    return errors?.flatten().fieldErrors;
  }, [errors]);

  const isFormInvalid = !formData.email || errors !== null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email to reset your password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
            />
            {fieldErrors?.email && (
              <p id="email-error" className="text-sm text-red-600">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-4">
          <Button className="w-full" type="submit" disabled={isFormInvalid}>
            Send reset link
          </Button>
          {apiMessage && (
            <p className="mt-2 text-sm text-green-600" aria-live="assertive">
              {apiMessage}
            </p>
          )}
          {apiError && (
            <p className="mt-2 text-sm text-red-600" aria-live="assertive">
              {apiError}
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <a href="/login" className="underline">
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
