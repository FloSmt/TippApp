import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.getByTestId('test-header').innerText()).toContain(
    'Welcome'
  );
});
