import { expect } from '@playwright/test';
import { test } from '../../fixtures/tipgroup.fixture';
import { waitForErrorNotification, waitForSuccessNotification } from '../../helper/notification-helper';
import { clearMocks, mockAvailableLeagues, mockTipgroupCreate, mockTipgroupList } from '../../helper/mock-manager';

test.describe('Tipgroup-Management', () => {
  test.describe('Tipgroup-List Page', () => {
    test('should show available Tipgroups', async ({ tipgroupListPage }) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem.first()).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);
      await expect(tipgroupListPage.tipgroupItem.nth(0)).toContainText('Testgroup1');
      await expect(tipgroupListPage.tipgroupItem.nth(1)).toContainText('Testgroup2');
      await expect(tipgroupListPage.tipgroupItem.nth(2)).toContainText('Testgroup3');
    });

    test('should show an error if something went wrong on loading tipgroups', async ({ tipgroupListPage }) => {
      await mockTipgroupList(tipgroupListPage.page, { status: 500 });

      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.errorCard).toBeVisible();
    });

    test('should show a information if the matchday-list is empty', async ({ tipgroupListPage }) => {
      await mockTipgroupList(tipgroupListPage.page, { body: [] });

      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.emptyCard).toBeVisible();
    });

    test('should show a refresher-icon on refresh and update the list', async ({ tipgroupListPage }) => {
      await expect(tipgroupListPage.skeletonCard).toBeVisible();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(3);

      await mockTipgroupList(tipgroupListPage.page, {
        body: [
          { id: 1, name: 'Testgroup1', currentSeasonId: 1 },
          { id: 2, name: 'Testgroup2', currentSeasonId: 2 },
        ],
      });

      await tipgroupListPage.pullToRefresh();

      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.tipgroupItem).toHaveCount(2);

      await mockTipgroupList(tipgroupListPage.page, { body: [], status: 500 });

      await tipgroupListPage.pullToRefresh();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeVisible();
      await expect(tipgroupListPage.skeletonCard).toBeHidden();
      await expect(tipgroupListPage.getRefreshSpinner()).toBeHidden();
      await expect(tipgroupListPage.errorCard).toBeVisible();
    });
  });

  test.describe('Create Tipgroup', () => {
    test('should create a new Tipgroup', async ({ tipgroupListPage, tipgroupCreateDialog }) => {
      const newTipgroupName = 'New Testgroup';
      await mockTipgroupCreate(tipgroupListPage.page, { body: { id: 4, name: newTipgroupName, currentSeasonId: 4 } });

      await tipgroupListPage.openCreateTipgroupDialog();
      await expect(tipgroupCreateDialog.spinner).toBeVisible();
      await tipgroupCreateDialog.spinner.waitFor({ state: 'hidden' });

      await tipgroupCreateDialog.fillTipgroupDialog(newTipgroupName, 0, 'password123');
      await tipgroupCreateDialog.submit();
      await tipgroupListPage.joinTipgroupButton.waitFor({ state: 'visible' });

      await expect(tipgroupListPage.tipgroupItem.last()).toContainText(newTipgroupName);

      await waitForSuccessNotification({
        header: 'Tippgruppe erstellt',
        message: `${newTipgroupName} wurde erfolgreich erstellt.`,
        page: tipgroupListPage.page,
      });
    });

    test('should show validation errors', async ({ tipgroupListPage, tipgroupCreateDialog }) => {
      await tipgroupListPage.openCreateTipgroupDialog();
      await expect(tipgroupCreateDialog.spinner).toBeVisible();
      await tipgroupCreateDialog.spinner.waitFor({ state: 'hidden' });

      await tipgroupCreateDialog.fillTipgroupDialog('', 0, '');

      await expect(tipgroupCreateDialog.createButton).toHaveAttribute('disabled');

      await expect(tipgroupCreateDialog.inputErrorText(tipgroupCreateDialog.tipgroupNameInput)).toHaveText(
        'Dieses Feld ist erforderlich.'
      );
      await expect(tipgroupCreateDialog.inputErrorText(tipgroupCreateDialog.passwordInput)).toHaveText(
        'Dieses Feld ist erforderlich.'
      );
      await expect(tipgroupCreateDialog.inputErrorText(tipgroupCreateDialog.passwordConfirmInput)).toHaveText(
        'Dieses Feld ist erforderlich.'
      );
    });

    test('should show an error-notification if fetch available leagues fails', async ({
      tipgroupListPage,
      tipgroupCreateDialog,
    }) => {
      await mockAvailableLeagues(tipgroupListPage.page, { status: 500 });

      await tipgroupListPage.openCreateTipgroupDialog();
      await expect(tipgroupCreateDialog.spinner).toBeVisible();
      await expect(tipgroupCreateDialog.spinner).toBeHidden();

      await expect(tipgroupCreateDialog.errorCard).toBeVisible();

      await waitForErrorNotification({
        message: 'Ein unbekannter Fehler ist aufgetreten. Versuche es später erneut.',
        page: tipgroupListPage.page,
      });
    });

    test('should show an error-notification if create matchday fails', async ({
      tipgroupListPage,
      tipgroupCreateDialog,
    }) => {
      await mockTipgroupCreate(tipgroupCreateDialog.page, { body: [], status: 500 });

      await tipgroupListPage.openCreateTipgroupDialog();
      await expect(tipgroupCreateDialog.spinner).toBeVisible();
      await tipgroupCreateDialog.spinner.waitFor({ state: 'hidden' });

      await tipgroupCreateDialog.fillTipgroupDialog('New Testgroup', 0, 'password123');
      await tipgroupCreateDialog.submit();

      await waitForErrorNotification({
        message: 'Ein unbekannter Fehler ist aufgetreten. Versuche es später erneut.',
        page: tipgroupListPage.page,
      });
    });
  });

  test.afterEach(async () => {
    clearMocks();
  });
});
