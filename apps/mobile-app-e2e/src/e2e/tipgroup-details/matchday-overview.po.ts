import { Locator, Page } from '@playwright/test';

export class MatchdayOverviewPage {
  readonly page: Page;

  readonly errorCard: Locator;
  readonly skeletons: Locator;
  readonly spinner: Locator;
  readonly matchItems: Locator;
  readonly refresherContent: Locator;
  readonly nextMatchdayButton: Locator;
  readonly previousMatchdayButton: Locator;
  readonly matchdaySelector: Locator;
  readonly matchdaySelects: Locator;

  constructor(page: Page) {
    this.page = page;
    this.errorCard = this.page.getByTestId('error-card');
    this.skeletons = this.page.getByTestId('skeletons');
    this.spinner = this.page.getByTestId('spinner');
    this.matchItems = this.page.getByTestId('match-card');
    this.refresherContent = this.page.getByTestId('refresher-content');
    this.previousMatchdayButton = this.page.getByTestId('previous-matchday-button');
    this.nextMatchdayButton = this.page.getByTestId('next-matchday-button');
    this.matchdaySelector = this.page.getByTestId('matchday-selector');
    this.matchdaySelects = this.page.getByTestId('matchday-select');
  }

  async goto() {
    await this.page.goto('');
    await this.page.waitForURL('');
  }

  getRefreshSpinner() {
    return this.refresherContent.locator('ion-spinner').nth(1);
  }

  async pullToRefresh() {
    const centerPoint = {
      x: this.page.viewportSize().width / 2,
      y: this.page.viewportSize().height / 2,
    };
    await this.page.locator('ion-content:visible').nth(1).hover();
    await this.page.mouse.down();
    await this.page.mouse.move(centerPoint.x, centerPoint.y + 200, {
      steps: 20,
    });
    await this.page.mouse.up();
  }
}
