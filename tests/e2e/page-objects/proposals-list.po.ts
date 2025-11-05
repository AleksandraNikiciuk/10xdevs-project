import type { Locator, Page } from "@playwright/test";

import { ProposalCardPO } from "./proposal-card.po";

export class ProposalsListPO {
  readonly root: Locator;
  readonly listItems: Locator;
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId("proposals-list");
    this.listItems = this.root.getByTestId(/proposal-list-item-/);
    this.cards = this.root.getByTestId(/proposal-card-/);
  }

  getCardByIndex(index: number) {
    return new ProposalCardPO(this.cards.nth(index));
  }

  async count() {
    return this.cards.count();
  }
}
