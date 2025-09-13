import {Locator, Page} from "@playwright/test";

export class TipgroupListPage {
  readonly page: Page;

  readonly createTipgroupButton: Locator;
  readonly joinTipgroupButton: Locator;
  readonly header: Locator;
  readonly errorCard: Locator;
  readonly skeletonCard: Locator;
  readonly emptyCard: Locator;
  readonly itemGroup: Locator;
  readonly tipgroupItem: Locator;
  readonly refresherContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createTipgroupButton = this.page.getByTestId('create-tipgroup-button')
    this.joinTipgroupButton = this.page.getByTestId('join-tipgroup-button');
    this.errorCard = this.page.getByTestId('error-card');
    this.skeletonCard = this.page.getByTestId('skeleton-card');
    this.emptyCard = this.page.getByTestId('empty-card');
    this.itemGroup = this.page.getByTestId('item-group');
    this.tipgroupItem = this.page.getByTestId('tipgroup-item');
    this.refresherContent = this.page.getByTestId('refresher-content');
  }

  async goto() {
    await this.page.goto('');
    await this.page.waitForURL('')
  }

  getRefreshSpinner() {
    return this.refresherContent.locator('ion-spinner').nth(1);
  }

  async pullToRefresh() {
    const centerPoint = {
      x: this.page.viewportSize().width / 2,
      y: this.page.viewportSize().height / 2
    }
    await this.page.locator('ion-content:visible').hover();
    await this.page.mouse.down();
    await this.page.mouse.move(centerPoint.x, centerPoint.y + 200, {steps: 20});
    await this.page.mouse.up();
  }
}
