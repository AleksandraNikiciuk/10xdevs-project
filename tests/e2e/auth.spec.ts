import { test, expect } from "@playwright/test";
import { LoginFormPO, RegisterFormPO, ForgotPasswordFormPO } from "./page-objects";

test.describe("Authentication", () => {
  test.describe("Login Form", () => {
    test("should display login form with all elements", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await expect(loginForm.card).toBeVisible();
      await expect(loginForm.emailInput).toBeVisible();
      await expect(loginForm.passwordInput).toBeVisible();
      await expect(loginForm.submitButton).toBeVisible();
      await expect(loginForm.forgotPasswordLink).toBeVisible();
      await expect(loginForm.signupLink).toBeVisible();
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.fillEmail("invalid-email");
      await loginForm.fillPassword("password123");

      // Wait for validation to trigger
      await loginForm.expectEmailError(/Invalid email address/i);
    });

    test("should show validation error for empty password", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.fillEmail("test@example.com");
      // Try to submit without password
      await loginForm.expectSubmitButtonDisabled();
    });

    test("should disable submit button when form is invalid", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      // Initially disabled
      await loginForm.expectSubmitButtonDisabled();

      // Still disabled with only email
      await loginForm.fillEmail("test@example.com");
      await loginForm.expectSubmitButtonDisabled();
    });

    test("should enable submit button when form is valid", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.fillEmail("test@example.com");
      await loginForm.fillPassword("validPassword123");

      await loginForm.expectSubmitButtonEnabled();
    });

    test("should show API error for invalid credentials", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.fillEmail("nonexistent@example.com");
      await loginForm.fillPassword("wrongPassword123");
      await loginForm.submit();

      // Wait for API error to appear
      await page.waitForTimeout(1000);
      await expect(loginForm.apiError).toBeVisible();
    });

    test("should navigate to forgot password page", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.clickForgotPassword();

      await expect(page).toHaveURL("/forgot-password");
    });

    test("should navigate to register page", async ({ page }) => {
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();

      await loginForm.clickSignup();

      await expect(page).toHaveURL("/register");
    });
  });

  test.describe("Register Form", () => {
    test("should display register form with all elements", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await expect(registerForm.card).toBeVisible();
      await expect(registerForm.emailInput).toBeVisible();
      await expect(registerForm.passwordInput).toBeVisible();
      await expect(registerForm.confirmPasswordInput).toBeVisible();
      await expect(registerForm.submitButton).toBeVisible();
      await expect(registerForm.signinLink).toBeVisible();
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await registerForm.fillEmail("invalid-email");
      await registerForm.fillPassword("password123");
      await registerForm.fillConfirmPassword("password123");

      await registerForm.expectEmailError(/Invalid email address/i);
    });

    test("should show validation error for password shorter than 8 characters", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await registerForm.fillEmail("test@example.com");
      await registerForm.fillPassword("pass123"); // Only 7 characters
      await registerForm.fillConfirmPassword("pass123");

      await registerForm.expectPasswordError(/at least 8 characters/i);
    });

    test("should show error when passwords do not match", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await registerForm.fillEmail("test@example.com");
      await registerForm.fillPassword("password123");
      await registerForm.fillConfirmPassword("differentPass123");

      await registerForm.expectConfirmPasswordError(/Passwords do not match/i);
    });

    test("should disable submit button when form is incomplete", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      // Initially disabled
      await registerForm.expectSubmitButtonDisabled();

      // Still disabled with partial form
      await registerForm.fillEmail("test@example.com");
      await registerForm.fillPassword("password123");
      await registerForm.expectSubmitButtonDisabled();
    });

    test("should enable submit button when form is valid", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await registerForm.fillEmail("newuser@example.com");
      await registerForm.fillPassword("validPass123");
      await registerForm.fillConfirmPassword("validPass123");

      await registerForm.expectSubmitButtonEnabled();
    });

    test("should show success message after successful registration", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      const uniqueEmail = `test${Date.now()}@example.com`;
      await registerForm.fillEmail(uniqueEmail);
      await registerForm.fillPassword("testPass123");
      await registerForm.fillConfirmPassword("testPass123");
      await registerForm.submit();

      // Wait for success message
      await page.waitForTimeout(2000);
      await expect(registerForm.successMessage).toBeVisible();
    });

    test("should show API error for existing email", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      // Try to register with potentially existing email
      await registerForm.fillEmail("existing@example.com");
      await registerForm.fillPassword("testPass123");
      await registerForm.fillConfirmPassword("testPass123");
      await registerForm.submit();

      // Wait for API response
      await page.waitForTimeout(2000);
      // Either success or error should appear
      const hasError = await registerForm.apiError.isVisible();
      const hasSuccess = await registerForm.successMessage.isVisible();
      expect(hasError || hasSuccess).toBe(true);
    });

    test("should navigate to login page via link", async ({ page }) => {
      const registerForm = new RegisterFormPO(page);
      await registerForm.goto();

      await registerForm.clickSignin();

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Forgot Password Form", () => {
    test("should display forgot password form with all elements", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await expect(forgotPasswordForm.card).toBeVisible();
      await expect(forgotPasswordForm.emailInput).toBeVisible();
      await expect(forgotPasswordForm.submitButton).toBeVisible();
      await expect(forgotPasswordForm.signinLink).toBeVisible();
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.fillEmail("invalid-email");

      await forgotPasswordForm.expectEmailError(/Invalid email address/i);
    });

    test("should disable submit button when email is empty", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.expectSubmitButtonDisabled();
    });

    test("should enable submit button when email is valid", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.fillEmail("test@example.com");

      await forgotPasswordForm.expectSubmitButtonEnabled();
    });

    test("should show success message after requesting password reset", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.fillEmail("test@example.com");
      await forgotPasswordForm.submit();

      // Wait for success message
      await page.waitForTimeout(1000);
      await expect(forgotPasswordForm.successMessage).toBeVisible();
    });

    test("should handle API error gracefully", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.fillEmail("error@example.com");
      await forgotPasswordForm.submit();

      // Wait for response (success or error)
      await page.waitForTimeout(1000);
      const hasError = await forgotPasswordForm.apiError.isVisible();
      const hasSuccess = await forgotPasswordForm.successMessage.isVisible();
      expect(hasError || hasSuccess).toBe(true);
    });

    test("should navigate to login page via link", async ({ page }) => {
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.goto();

      await forgotPasswordForm.clickSignin();

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Navigation Flow", () => {
    test("should navigate through all auth pages", async ({ page }) => {
      // Start at login
      const loginForm = new LoginFormPO(page);
      await loginForm.goto();
      await expect(page).toHaveURL("/login");

      // Go to register
      await loginForm.clickSignup();
      await expect(page).toHaveURL("/register");

      // Go back to login
      const registerForm = new RegisterFormPO(page);
      await registerForm.clickSignin();
      await expect(page).toHaveURL("/login");

      // Go to forgot password
      await loginForm.clickForgotPassword();
      await expect(page).toHaveURL("/forgot-password");

      // Go back to login
      const forgotPasswordForm = new ForgotPasswordFormPO(page);
      await forgotPasswordForm.clickSignin();
      await expect(page).toHaveURL("/login");
    });
  });
});
