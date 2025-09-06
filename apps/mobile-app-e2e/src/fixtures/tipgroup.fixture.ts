import {test as base} from '@playwright/test';
import {mockResponse} from "../helper/response-helper";
import {TipgroupListPage} from "../page-objects/tipgroup-list.po";
import {setLoginContent} from "../helper/login-helper";

type TipgroupFixture = {
  tipgroupListPage: TipgroupListPage;
}

export const test = base.extend<TipgroupFixture>({
  tipgroupListPage: async ({page}, use) => {
    const tipgroupListPage = new TipgroupListPage(page);
    await setLoginContent(page);

    await mockResponse(page, 'api/user/tipgroups', {
      status: 200,
      body: [{id: 1, name: 'Testgroup1'}, {id: 2, name: 'Testgroup2'}, {id: 3, name: 'Testgroup3'}],
    })

    await tipgroupListPage.goto();

    await use(tipgroupListPage);
  },
})
