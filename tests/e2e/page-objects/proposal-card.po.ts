import { expect, type Locator } from "@playwright/test";

export class ProposalCardPO {
  readonly selectToggle: Locator;
  readonly editToggle: Locator;
  readonly questionText: Locator;
  readonly questionInput: Locator;
  readonly questionError: Locator;
  readonly answerText: Locator;
  readonly answerInput: Locator;
  readonly answerError: Locator;

  constructor(private readonly root: Locator) {
    this.selectToggle = root.getByTestId(/proposal-select-toggle-/);
    this.editToggle = root.getByTestId(/proposal-edit-toggle-/);
    this.questionText = root.getByTestId(/proposal-question-text-/);
    this.questionInput = root.getByTestId(/proposal-question-input-/);
    this.questionError = root.getByTestId(/proposal-question-error-/);
    this.answerText = root.getByTestId(/proposal-answer-text-/);
    this.answerInput = root.getByTestId(/proposal-answer-input-/);
    this.answerError = root.getByTestId(/proposal-answer-error-/);
  }

  async toggleSelection() {
    await this.selectToggle.click();
    // Wait for React state to update
    await this.root.page().waitForTimeout(100);
  }

  async enterEditMode() {
    await this.editToggle.click();
    // Wait for edit mode transition
    await this.root.page().waitForTimeout(100);
  }

  async fillQuestion(value: string) {
    await this.questionInput.click();
    await this.questionInput.clear();
    await this.questionInput.pressSequentially(value, { delay: 0 });
  }

  async fillAnswer(value: string) {
    await this.answerInput.click();
    await this.answerInput.clear();
    await this.answerInput.pressSequentially(value, { delay: 0 });
  }

  async expectSelected(expected: boolean) {
    await expect(this.selectToggle).toHaveAttribute("aria-pressed", String(expected));
  }

  async expectQuestion(value: string | RegExp) {
    if ((await this.questionText.count()) > 0) {
      await expect(this.questionText.first()).toHaveText(value);
      return;
    }

    await expect(this.questionInput).toHaveValue(value);
  }

  async expectAnswer(value: string | RegExp) {
    if ((await this.answerText.count()) > 0) {
      await expect(this.answerText.first()).toHaveText(value);
      return;
    }

    await expect(this.answerInput).toHaveValue(value);
  }

  async expectNoValidationErrors() {
    await expect(this.questionError).toHaveCount(0);
    await expect(this.answerError).toHaveCount(0);
  }
}
