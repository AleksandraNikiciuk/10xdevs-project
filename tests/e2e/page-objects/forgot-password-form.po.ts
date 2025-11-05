import { expect, type Locator, type Page } from "@playwright/test";

export class ForgotPasswordFormPO {
  readonly card: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly successMessage: Locator;
  readonly apiError: Locator;
  readonly signinLink: Locator;

  constructor(private readonly page: Page) {
    this.card = page.getByTestId("forgot-password-form-card");
    this.form = page.getByTestId("forgot-password-form");
    this.emailInput = page.getByTestId("forgot-password-email-input");
    this.submitButton = page.getByTestId("forgot-password-submit-button");
    this.emailError = page.getByTestId("forgot-password-email-error");
    this.successMessage = page.getByTestId("forgot-password-success-message");
    this.apiError = page.getByTestId("forgot-password-api-error");
    this.signinLink = page.getByTestId("forgot-password-signin-link");
  }

  async goto() {
    await this.page.goto("/forgot-password");
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

  async submit() {
    await this.submitButton.click();
  }

  async requestPasswordReset(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  async expectEmailError(message: string | RegExp) {
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toHaveText(message);
  }

  async expectSuccessMessage(message: string | RegExp) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toHaveText(message);
  }

  async expectApiError(message: string | RegExp) {
    await expect(this.apiError).toBeVisible();
    await expect(this.apiError).toHaveText(message);
  }

  async expectNoErrors() {
    await expect(this.emailError).toHaveCount(0);
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
