import { test as base } from '@playwright/test';
import { TipgroupListPage } from '../e2e/tipgroup-management/tipgroup-list.po';
import { setLoginContent } from '../helper/login-helper';
import { TipgroupCreateDialog } from '../e2e/tipgroup-management/tipgroup-create-dialog.po';
import { mockTipgroupListResponse } from '../helper/response-helper';

type TipgroupFixture = {
  tipgroupListPage: TipgroupListPage;
  tipgroupCreateDialog: TipgroupCreateDialog;
};

export const test = base.extend<TipgroupFixture>({
  tipgroupListPage: async ({ page }, use) => {
    const tipgroupListPage = new TipgroupListPage(page);
    await setLoginContent(page);

    await use(tipgroupListPage);
  },
  tipgroupCreateDialog: async ({ page }, use) => {
    const tipgroupCreateDialog = new TipgroupCreateDialog(page);
    await mockTipgroupListResponse(page, [], 200);

    await use(tipgroupCreateDialog);
  },
});
