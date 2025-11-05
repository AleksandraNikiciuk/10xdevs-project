import { expect, type Locator, type Page } from "@playwright/test";

import { GenerationFormPO } from "./generation-form.po";
import { ProposalsSectionPO } from "./proposals-section.po";

export class GeneratePagePO {
  readonly root: Locator;
  readonly backToDashboardLink: Locator;
  readonly backToDashboardButton: Locator;
  readonly emptyStateCard: Locator;
  readonly loadingSection: Locator;
  readonly errorAlert: Locator;
  readonly form: GenerationFormPO;
  readonly proposals: ProposalsSectionPO;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId("generate-view");
    this.backToDashboardLink = page.getByTestId("back-to-dashboard-link");
    this.backToDashboardButton = page.getByTestId("back-to-dashboard-button");
    this.emptyStateCard = page.getByTestId("empty-state-card");
    this.loadingSection = page.getByTestId("proposals-loading-section");
    this.errorAlert = page.getByTestId("generation-error-alert");
    this.form = new GenerationFormPO(page);
    this.proposals = new ProposalsSectionPO(page);
  }

  async goto() {
    await this.page.goto("/generate");
    await expect(this.root).toBeVisible();
    // Wait for React hydration
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);
  }

  async startGenerationWithText(text: string) {
    await this.form.fillSourceText(text);
    await this.form.submit();
  }

  async waitForLoadingToAppear() {
    await this.page.waitForSelector('[data-test-id="proposals-loading-section"]', { state: "visible" }).catch(() => {
      // Ignore if loading state doesn't appear (fast API response)
    });
  }

  async waitForLoadingToFinish() {
    await this.page.waitForSelector('[data-test-id="proposals-loading-section"]', { state: "hidden" }).catch(() => {
      // Ignore if loading state was never visible
    });
  }

  async waitForProposals() {
    await this.proposals.waitForVisible();
  }

  async expectEmptyStateVisible() {
    await expect(this.emptyStateCard).toBeVisible();
  }

  async expectErrorVisible() {
    await expect(this.errorAlert).toBeVisible();
  }
}
