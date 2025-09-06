import {expect} from '@playwright/test';
import {test} from './fixtures/tipgroup.fixture';
import {mockResponse} from "./helper/response-helper";

test.describe('Tipgroups', () => {
  test.describe('Tipgroup-List Page', () => {
    test('should show available Tipgroups', async ({tipgroupListPage}) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem.first()).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);
      await expect(tipgroupListPage.tipgroupItem.nth(0)).toHaveText('Testgroup1');
      await expect(tipgroupListPage.tipgroupItem.nth(1)).toHaveText('Testgroup2');
      await expect(tipgroupListPage.tipgroupItem.nth(2)).toHaveText('Testgroup3');
    });

    test('should show an error if something went wrong on loading tipgroups', async ({tipgroupListPage, page}) => {
      await mockResponse(page, 'api/user/tipgroups', {
        status: 500,
        body: {},
      });
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.errorCard).toBeVisible();

    });

    test('should show a information if the tipgroup-list is empty', async ({tipgroupListPage, page}) => {
      await mockResponse(page, 'api/user/tipgroups', {
        status: 200,
        body: [],
      });
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.emptyCard).toBeVisible();

    });

    test('should show a refresher-icon on refresh and update the list', async ({tipgroupListPage, page}) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);

      await mockResponse(page, 'api/user/tipgroups', {
        status: 200,
        body: [{id: 1, name: 'Testgroup1'}, {id: 2, name: 'Testgroup2'}],
      });

      await tipgroupListPage.pullToRefresh();

      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(2);

      await mockResponse(page, 'api/user/tipgroups', {
        status: 500,
        body: [],
      });

      await tipgroupListPage.pullToRefresh();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.errorCard).toBeVisible()
    });
  });
});
