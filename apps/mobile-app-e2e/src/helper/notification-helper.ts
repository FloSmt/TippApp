import { expect, Page } from '@playwright/test';

export interface NotificationOptionsHelper {
  message?: string;
  header?: string;
  page: Page;
}

export async function waitForSuccessNotification(notificationConfig: NotificationOptionsHelper) {
  const toastElement = notificationConfig.page.locator('ion-toast.toast-success').first();
  const containsHeader = notificationConfig.header || '';
  await expect(toastElement).toBeVisible();
  if (notificationConfig.message) {
    await expect(toastElement).toHaveText(containsHeader + notificationConfig.message);
  }
}

export async function waitForErrorNotification(notificationConfig: NotificationOptionsHelper) {
  const toastElement = notificationConfig.page.locator('ion-toast.toast-error');
  const containsHeader = notificationConfig.header || '';

  await expect(toastElement).toBeVisible();
  if (notificationConfig.message) {
    await expect(toastElement).toHaveText(containsHeader + notificationConfig.message);
  }
}

export async function waitForInfoNotification(notificationConfig: NotificationOptionsHelper) {
  const toastElement = notificationConfig.page.locator('ion-toast.toast-info');
  const containsHeader = notificationConfig.header || '';

  await expect(toastElement).toBeVisible();
  if (notificationConfig.message) {
    await expect(toastElement).toHaveText(containsHeader + notificationConfig.message);
  }
}
