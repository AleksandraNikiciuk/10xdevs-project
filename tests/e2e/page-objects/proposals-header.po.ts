import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class ProposalsHeaderPO {
  readonly root: Locator;
  readonly selectionCounter: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  readonly cancelDialog: Locator;
  readonly cancelDialogContent: Locator;
  readonly cancelDialogConfirm: Locator;
  readonly cancelDialogKeepEditing: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId("proposals-header");
    this.selectionCounter = this.root.getByTestId("proposals-selection-counter");
    this.cancelButton = this.root.getByTestId("cancel-generation-button");
    this.saveButton = this.root.getByTestId("save-selected-button");
    this.cancelDialog = page.getByTestId("cancel-generation-dialog");
    this.cancelDialogContent = page.getByTestId("cancel-generation-dialog-content");
    this.cancelDialogConfirm = page.getByTestId("cancel-dialog-confirm-button");
    this.cancelDialogKeepEditing = page.getByTestId("cancel-dialog-keep-editing-button");
  }

  async expectSelectedCount(selected: number, total: number) {
    await expect(this.selectionCounter).toHaveText(new RegExp(`Selected:s+${selected}s+/s+${total}`));
  }

  async saveSelected() {
    await this.saveButton.click();
  }

  async cancelGeneration(confirm = false) {
    await this.cancelButton.click();

    if (!(await this.cancelDialogContent.isVisible())) {
      return;
    }

    if (!confirm) {
      await this.cancelDialogKeepEditing.click();
      return;
    }

    await this.cancelDialogConfirm.click();
  }
}
