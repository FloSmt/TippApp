import { expect } from '@playwright/test';
import { test } from '../../fixtures/tipgroup.fixture';
import {
  mockAvailableLeaguesResponse,
  mockCreateTipgroupResponse,
  mockTipgroupListResponse,
} from '../../helper/response-helper';
import { waitForSuccessNotification } from '../../helper/notification-helper';

test.describe('Tipgroups', () => {
  test.describe('Tipgroup-List Page', () => {
    test('should show available Tipgroups', async ({ tipgroupListPage }) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem.first()).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);
      await expect(tipgroupListPage.tipgroupItem.nth(0)).toHaveText(
        'Testgroup1'
      );
      await expect(tipgroupListPage.tipgroupItem.nth(1)).toHaveText(
        'Testgroup2'
      );
      await expect(tipgroupListPage.tipgroupItem.nth(2)).toHaveText(
        'Testgroup3'
      );
    });

    test('should show an error if something went wrong on loading tipgroups', async ({
      tipgroupListPage,
      page,
    }) => {
      await mockTipgroupListResponse(page, {}, 500);

      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.errorCard).toBeVisible();
    });

    test('should show a information if the tipgroup-list is empty', async ({
      tipgroupListPage,
      page,
    }) => {
      await mockTipgroupListResponse(page, [], 200);

      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.emptyCard).toBeVisible();
    });

    test('should show a refresher-icon on refresh and update the list', async ({
      tipgroupListPage,
      page,
    }) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);

      await mockTipgroupListResponse(
        page,
        [
          { id: 1, name: 'Testgroup1' },
          { id: 2, name: 'Testgroup2' },
        ],
        200
      );

      await tipgroupListPage.pullToRefresh();

      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(2);

      await mockTipgroupListResponse(page, [], 500);

      await tipgroupListPage.pullToRefresh();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.errorCard).toBeVisible();
    });
  });

  test.describe('Create Tipgroup', () => {
    test('should create a new Tipgroup', async ({
      tipgroupListPage,
      tipgroupCreateDialog,
      page,
    }) => {
      const newTipgroupName = 'New Testgroup';
      await mockAvailableLeaguesResponse(page);
      await mockCreateTipgroupResponse(page, { id: 4, name: newTipgroupName });

      await expect(tipgroupListPage.emptyCard).toBeVisible();

      await tipgroupListPage.openCreateTipgroupDialog();
      await expect(tipgroupCreateDialog.spinner).toBeVisible();
      await tipgroupCreateDialog.spinner.waitFor({ state: 'hidden' });

      await tipgroupCreateDialog.fillTipgroupDialog(
        newTipgroupName,
        0,
        'password123'
      );
      await tipgroupCreateDialog.submit();
      await tipgroupListPage.joinTipgroupButton.waitFor({ state: 'visible' });

      await expect(tipgroupListPage.tipgroupItem.last()).toHaveText(
        newTipgroupName
      );

      await waitForSuccessNotification(
        `${newTipgroupName} wurde erfolgreich erstellt.`,
        page
      );
    });
  });
});
