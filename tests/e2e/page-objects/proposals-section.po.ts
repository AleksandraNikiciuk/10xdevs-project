import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { ProposalsHeaderPO } from "./proposals-header.po";
import { ProposalsListPO } from "./proposals-list.po";

export class ProposalsSectionPO {
  readonly root: Locator;
  readonly header: ProposalsHeaderPO;
  readonly list: ProposalsListPO;
  readonly status: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId("proposals-section");
    this.header = new ProposalsHeaderPO(page);
    this.list = new ProposalsListPO(page);
    this.status = page.getByTestId("proposals-status");
  }

  async waitForVisible() {
    await expect(this.root).toBeVisible();
  }

  async waitForStatusUpdate(expected: RegExp | string) {
    await expect(this.status).toHaveText(expected);
  }
}
