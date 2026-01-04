import { test as base } from '@playwright/test';
import { TipgroupListPage } from '../e2e/tipgroup-management/tipgroup-list.po';
import { navigateToTipgroupList } from '../helper/navigation-helper';
import { TipgroupCreateDialog } from '../e2e/tipgroup-management/tipgroup-create-dialog.po';
import { mockAvailableLeagues, mockTipgroupCreate, mockTipgroupList } from '../helper/mock-manager';

type TipgroupManagementFixture = {
  tipgroupListPage: TipgroupListPage;
  tipgroupCreateDialog: TipgroupCreateDialog;
};

export const test = base.extend<TipgroupManagementFixture>({
  tipgroupListPage: async ({ page }, use) => {
    const tipgroupListPage = new TipgroupListPage(page);
    await navigateToTipgroupList(tipgroupListPage.page);
    await mockTipgroupList(page);

    await use(tipgroupListPage);
  },
  tipgroupCreateDialog: async ({ page }, use) => {
    const tipgroupCreateDialog = new TipgroupCreateDialog(page);
    await navigateToTipgroupList(tipgroupCreateDialog.page);

    await mockAvailableLeagues(page);
    await mockTipgroupCreate(page);

    await use(tipgroupCreateDialog);
  },
});
