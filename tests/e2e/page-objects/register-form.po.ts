import { expect, type Locator, type Page } from "@playwright/test";

export class RegisterFormPO {
  readonly card: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly apiError: Locator;
  readonly successMessage: Locator;
  readonly signinLink: Locator;

  constructor(private readonly page: Page) {
    this.card = page.getByTestId("register-form-card");
    this.form = page.getByTestId("register-form");
    this.emailInput = page.getByTestId("register-email-input");
    this.passwordInput = page.getByTestId("register-password-input");
    this.confirmPasswordInput = page.getByTestId("register-confirm-password-input");
    this.submitButton = page.getByTestId("register-submit-button");
    this.emailError = page.getByTestId("register-email-error");
    this.passwordError = page.getByTestId("register-password-error");
    this.confirmPasswordError = page.getByTestId("register-confirm-password-error");
    this.apiError = page.getByTestId("register-api-error");
    this.successMessage = page.getByTestId("register-success-message");
    this.signinLink = page.getByTestId("register-signin-link");
  }

  async goto() {
    await this.page.goto("/register");
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

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.click();
    await this.confirmPasswordInput.clear();
    await this.confirmPasswordInput.fill(password);
  }

  async fillRegistrationForm(email: string, password: string, confirmPassword: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
  }

  async submit() {
    await this.submitButton.click();
  }

  async register(email: string, password: string, confirmPassword: string) {
    await this.fillRegistrationForm(email, password, confirmPassword);
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

  async expectConfirmPasswordError(message: string | RegExp) {
    await expect(this.confirmPasswordError).toBeVisible();
    await expect(this.confirmPasswordError).toHaveText(message);
  }

  async expectApiError(message: string | RegExp) {
    await expect(this.apiError).toBeVisible();
    await expect(this.apiError).toHaveText(message);
  }

  async expectSuccessMessage(message: string | RegExp) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toHaveText(message);
  }

  async expectNoErrors() {
    await expect(this.emailError).toHaveCount(0);
    await expect(this.passwordError).toHaveCount(0);
    await expect(this.confirmPasswordError).toHaveCount(0);
    await expect(this.apiError).toHaveCount(0);
  }

  async expectSubmitButtonDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  async clickSignin() {
    await this.signinLink.click();
  }
}
