import { Page } from '@playwright/test';
import {
  mockLoginUserResponse,
  mockTipgroupListResponse,
} from './response-helper';
import { LoginPage } from '../e2e/auth/login.po';

export async function setLoginContent(page: Page) {
  await mockLoginUserResponse(page);
  await mockTipgroupListResponse(page);
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillInputs('testuser@emai.de', 'testpassword');
  await loginPage.loginButton.click();
  await page.waitForURL('/');
}
