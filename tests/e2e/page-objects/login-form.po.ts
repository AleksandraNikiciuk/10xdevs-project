import { expect, type Locator, type Page } from "@playwright/test";

export class LoginFormPO {
  readonly card: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly apiError: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;

  constructor(private readonly page: Page) {
    this.card = page.getByTestId("login-form-card");
    this.form = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
    this.emailError = page.getByTestId("login-email-error");
    this.passwordError = page.getByTestId("login-password-error");
    this.apiError = page.getByTestId("login-api-error");
    this.forgotPasswordLink = page.getByTestId("login-forgot-password-link");
    this.signupLink = page.getByTestId("login-signup-link");
  }

  async goto() {
    await this.page.goto("/login");
    await expect(this.card).toBeVisible();
    // Wait for React hydration
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);
  }

  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  async fillCredentials(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async expectEmailError(message: string | RegExp) {
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toHaveText(message);
  }

  async expectPasswordError(message: string | RegExp) {
    await expect(this.passwordError).toBeVisible();
    await expect(this.passwordError).toHaveText(message);
  }

  async expectApiError(message: string | RegExp) {
    await expect(this.apiError).toBeVisible();
    await expect(this.apiError).toHaveText(message);
  }

  async expectNoErrors() {
    await expect(this.emailError).toHaveCount(0);
    await expect(this.passwordError).toHaveCount(0);
    await expect(this.apiError).toHaveCount(0);
  }

  async expectSubmitButtonDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickSignup() {
    await this.signupLink.click();
  }
}
