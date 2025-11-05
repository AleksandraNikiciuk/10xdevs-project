import { expect, type Locator, type Page } from "@playwright/test";

export class GenerationFormPO {
  readonly section: Locator;
  readonly form: Locator;
  readonly textarea: Locator;
  readonly characterCounter: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.section = page.getByTestId("generation-form-section");
    this.form = this.section.getByTestId("generation-form");
    this.textarea = this.section.getByTestId("source-text-textarea");
    this.characterCounter = this.section.getByTestId("source-text-character-counter");
    this.submitButton = page.getByTestId("generate-submit-button");
  }

  async fillSourceText(value: string) {
    await this.textarea.click();
    await this.textarea.clear();
    // Use pressSequentially for better React compatibility
    await this.textarea.pressSequentially(value, { delay: 0 });
  }

  async clearSourceText() {
    await this.textarea.fill("");
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectCharacterCount(count: number, max = 10000) {
    await expect(this.characterCounter).toHaveText(`${count} / ${max}`);
  }

  async expectValidationError(message: string | RegExp) {
    const errorLocator = this.section.getByTestId("source-text-error");
    await expect(errorLocator).toHaveText(message);
  }

  async expectNoValidationError() {
    const errorLocator = this.section.getByTestId("source-text-error");
    await expect(errorLocator).toHaveCount(0);
  }
}
