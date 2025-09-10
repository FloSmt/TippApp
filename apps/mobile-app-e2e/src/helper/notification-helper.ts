import { expect, Page } from '@playwright/test';

export async function waitForSuccessNotification(message: string, page: Page) {
  const toastElement = page.locator('ion-toast.toast-success');
  await expect(toastElement).toBeVisible();
  await expect(toastElement).toHaveText(message);
}

export async function waitForErrorNotification(message: string, page: Page) {
  const toastElement = page.locator('ion-toast.toast-error');
  await expect(toastElement).toBeVisible();
  await expect(toastElement).toHaveText(message);
}

export async function waitForInfoNotification(message: string, page: Page) {
  const toastElement = page.locator('ion-toast.toast-info');
  await expect(toastElement).toBeVisible();
  await expect(toastElement).toHaveText(message);
}
