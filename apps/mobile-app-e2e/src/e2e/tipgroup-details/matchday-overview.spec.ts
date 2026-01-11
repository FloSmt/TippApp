import { expect } from '@playwright/test';
import { test } from '../../fixtures/tipgroup-details.fixture';

import {
  clearMocks,
  mockGetAllMatchdays,
  mockGetCurrentMatchday,
  mockGetMatchday,
  mockTipgroupDetails,
} from '../../helper/mock-manager';
import { navigateToTipgroupDetails } from '../../helper/navigation-helper';
import { matchdayDetailsMockResponse } from '../../helper/responses';
import { waitForErrorNotification } from '../../helper/notification-helper';

test.describe('Matchday Overview', () => {
  test('should show current Matchday and switch to next and previous Matchday via button', async ({
    matchdayOverviewPage,
  }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page);
    await mockGetAllMatchdays(matchdayOverviewPage.page);
    await mockGetCurrentMatchday(matchdayOverviewPage.page);

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.spinner).toBeVisible();
    await expect(matchdayOverviewPage.skeletons).toBeHidden();

    await expect(matchdayOverviewPage.matchItems).toBeVisible();
    expect(await matchdayOverviewPage.matchItems.count()).toBe(1);
    await expect(matchdayOverviewPage.page.getByText('Team1')).toBeVisible();
    await expect(matchdayOverviewPage.page.getByText('Team2')).toBeVisible();
    await expect(matchdayOverviewPage.previousMatchdayButton).toContainClass('disabled');

    await mockGetMatchday(matchdayOverviewPage.page);

    await matchdayOverviewPage.nextMatchdayButton.click();
    await expect(matchdayOverviewPage.skeletons).toBeVisible();
    await expect(matchdayOverviewPage.spinner).toBeHidden();
    await expect(matchdayOverviewPage.page.getByText('Team1')).toBeHidden();
    await expect(matchdayOverviewPage.page.getByText('Team3')).toBeVisible();
    await expect(matchdayOverviewPage.page.getByText('Team4')).toBeVisible();
    await expect(matchdayOverviewPage.nextMatchdayButton).toContainClass('disabled');

    await mockGetMatchday(matchdayOverviewPage.page, { body: matchdayDetailsMockResponse[0] });
    await matchdayOverviewPage.previousMatchdayButton.click();

    // no Skeletons are shown because the matchday was cached before
    await expect(matchdayOverviewPage.skeletons).toBeHidden();
    await expect(matchdayOverviewPage.spinner).toBeHidden();
    await expect(matchdayOverviewPage.page.getByText('Team1')).toBeVisible();
    await expect(matchdayOverviewPage.page.getByText('Team3')).toBeHidden();
  });

  test('should switch the matchday with the selector menu', async ({ matchdayOverviewPage }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page);
    await mockGetAllMatchdays(matchdayOverviewPage.page);
    await mockGetCurrentMatchday(matchdayOverviewPage.page);

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.matchItems).toBeVisible();
    await expect(matchdayOverviewPage.page.getByText('1. Spieltag')).toBeVisible();

    await matchdayOverviewPage.matchdaySelector.click();
    await expect(matchdayOverviewPage.matchdaySelects.first()).toBeVisible();
    expect(await matchdayOverviewPage.matchdaySelects.count()).toBe(2);
    await expect(matchdayOverviewPage.matchdaySelects.first()).toContainText('1. Spieltag');
    await expect(matchdayOverviewPage.matchdaySelects.first()).toContainClass('active');
    await expect(matchdayOverviewPage.matchdaySelects.last()).not.toContainClass('active');

    await mockGetMatchday(matchdayOverviewPage.page);
    await matchdayOverviewPage.matchdaySelects.nth(1).click();
    await expect(matchdayOverviewPage.matchdaySelects.first()).toBeHidden();
    await expect(matchdayOverviewPage.page.getByText('2. Spieltag')).toBeVisible();

    await matchdayOverviewPage.matchdaySelector.click();
    await expect(matchdayOverviewPage.matchdaySelects.first()).toBeVisible();
    await expect(matchdayOverviewPage.matchdaySelects.first()).not.toContainClass('active');
    await expect(matchdayOverviewPage.matchdaySelects.last()).toContainClass('active');
  });

  test('should show refresh Matchdays with refresher and show error-card if matchday fetch failed', async ({
    matchdayOverviewPage,
  }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page);
    await mockGetAllMatchdays(matchdayOverviewPage.page);
    await mockGetCurrentMatchday(matchdayOverviewPage.page);

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.page.getByText('1. Spieltag')).toBeVisible();
    await expect(matchdayOverviewPage.matchItems.first()).toBeVisible();

    await mockGetMatchday(matchdayOverviewPage.page, { status: 500 });
    await matchdayOverviewPage.nextMatchdayButton.click();
    await expect(matchdayOverviewPage.skeletons).toBeVisible();
    await expect(matchdayOverviewPage.errorCard).toBeVisible();
    await waitForErrorNotification({ page: matchdayOverviewPage.page });

    await mockGetMatchday(matchdayOverviewPage.page);
    await matchdayOverviewPage.pullToRefresh();

    await expect(matchdayOverviewPage.page.getByText('2. Spieltag')).toBeVisible();
    await expect(matchdayOverviewPage.matchItems.first()).toBeVisible();
  });

  test('should show an error-card if tipgroup-details failed to load', async ({ matchdayOverviewPage }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page, { status: 500 });
    await mockGetAllMatchdays(matchdayOverviewPage.page);
    await mockGetCurrentMatchday(matchdayOverviewPage.page);

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.errorCard).toBeVisible();
    await waitForErrorNotification({ page: matchdayOverviewPage.page });
  });

  test('should show an error-card if getCurrentMatchday data failed to load', async ({ matchdayOverviewPage }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page);
    await mockGetAllMatchdays(matchdayOverviewPage.page);
    await mockGetCurrentMatchday(matchdayOverviewPage.page, { status: 500 });

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.errorCard).toBeVisible();
    await waitForErrorNotification({ page: matchdayOverviewPage.page });
  });

  test('should show an error-card if getAllMatchdays data failed to load', async ({ matchdayOverviewPage }) => {
    await mockTipgroupDetails(matchdayOverviewPage.page);
    await mockGetAllMatchdays(matchdayOverviewPage.page, { status: 500 });
    await mockGetCurrentMatchday(matchdayOverviewPage.page);

    await navigateToTipgroupDetails(matchdayOverviewPage.page);

    await expect(matchdayOverviewPage.errorCard).toBeVisible();
    await waitForErrorNotification({ page: matchdayOverviewPage.page });
  });

  test.afterEach(() => {
    clearMocks();
  });
});
