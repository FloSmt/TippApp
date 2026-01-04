import { test as base } from '@playwright/test';
import { TipgroupListPage } from '../e2e/tipgroup-management/tipgroup-list.po';
import { setLoginContent } from '../helper/login-helper';
import { TipgroupCreateDialog } from '../e2e/tipgroup-management/tipgroup-create-dialog.po';
import { mockAvailableLeagues, mockTipgroupCreate, mockTipgroupList } from '../helper/mock-manager';

type TipgroupFixture = {
  tipgroupListPage: TipgroupListPage;
  tipgroupCreateDialog: TipgroupCreateDialog;
};

export const test = base.extend<TipgroupFixture>({
  tipgroupListPage: async ({ page }, use) => {
    const tipgroupListPage = new TipgroupListPage(page);
    await setLoginContent(tipgroupListPage.page);
    await mockTipgroupList(page);

    await use(tipgroupListPage);
  },
  tipgroupCreateDialog: async ({ page }, use) => {
    const tipgroupCreateDialog = new TipgroupCreateDialog(page);
    await setLoginContent(tipgroupCreateDialog.page);

    await mockAvailableLeagues(page);
    await mockTipgroupCreate(page);

    await use(tipgroupCreateDialog);
  },
});
