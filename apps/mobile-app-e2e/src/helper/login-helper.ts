import { Page } from '@playwright/test';
import { LoginPage } from '../e2e/auth/login.po';
import { mockLoginUser } from './mock-manager';

export async function setLoginContent(page: Page) {
  const loginPage = new LoginPage(page);
  await mockLoginUser(loginPage.page);

  await loginPage.goto();
  await loginPage.fillInputs('testuser@emai.de', 'testpassword');
  await loginPage.loginButton.click();
  await page.waitForURL('');
}
