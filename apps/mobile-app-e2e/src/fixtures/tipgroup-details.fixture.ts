import { test as base } from '@playwright/test';
import { MatchdayOverviewPage } from '../e2e/tipgroup-details/matchday-overview.po';

type TipgroupDetailsFixture = {
  matchdayOverviewPage: MatchdayOverviewPage;
};

export const test = base.extend<TipgroupDetailsFixture>({
  matchdayOverviewPage: async ({ page }, use) => {
    const matchdayOverviewPage = new MatchdayOverviewPage(page);

    await use(matchdayOverviewPage);
  },
});
