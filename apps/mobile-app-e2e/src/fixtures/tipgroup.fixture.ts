import { test as base } from '@playwright/test';
import { mockTipgroupListResponse } from '../helper/response-helper';
import { TipgroupListPage } from '../page-objects/tipgroup-list.po';
import { setLoginContent } from '../helper/login-helper';

type TipgroupFixture = {
  tipgroupListPage: TipgroupListPage;
};

export const test = base.extend<TipgroupFixture>({
  tipgroupListPage: async ({ page }, use) => {
    const tipgroupListPage = new TipgroupListPage(page);
    await setLoginContent(page);
    await mockTipgroupListResponse(page);

    await tipgroupListPage.goto();

    await use(tipgroupListPage);
  },
});
