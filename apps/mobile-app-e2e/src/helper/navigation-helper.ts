import { Page } from '@playwright/test';
import { LoginPage } from '../e2e/auth/login.po';
import { mockLoginUser, mockRefreshUser, mockTipgroupList } from './mock-manager';
import { TipgroupListPage } from '../e2e/tipgroup-management/tipgroup-list.po';

export async function navigateToTipgroupList(page: Page) {
  const loginPage = new LoginPage(page);
  await mockLoginUser(loginPage.page);
  await mockRefreshUser(loginPage.page);

  await loginPage.goto();
  await loginPage.fillInputs('testuser@emai.de', 'testpassword');
  await loginPage.loginButton.click();
  await page.waitForURL('');
}

export async function navigateToTipgroupDetails(page: Page) {
  await navigateToTipgroupList(page);
  await mockTipgroupList(page);

  const tipgroupListPage = new TipgroupListPage(page);
  await tipgroupListPage.tipgroupItem.first().waitFor({ state: 'visible' });
  await tipgroupListPage.tipgroupItem.first().click();
}
