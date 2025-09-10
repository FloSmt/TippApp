import { Page } from '@playwright/test';
import { mockRefreshUserResponse } from './response-helper';

export async function setLoginContent(page: Page) {
  await mockRefreshUserResponse(page);
}
