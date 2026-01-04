import { Locator, Page } from '@playwright/test';

export class TipgroupCreateDialog {
  readonly page: Page;

  readonly tipgroupNameInput: Locator;
  readonly leagueSelection: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly createButton: Locator;
  readonly errorCard: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tipgroupNameInput = this.page.getByTestId('tipgroup-name-input');
    this.leagueSelection = this.page.getByTestId('tipgroup-league-select');
    this.passwordInput = this.page.getByTestId('password-input');
    this.passwordConfirmInput = this.page.getByTestId('password-confirm-input');
    this.createButton = this.page.getByTestId('create-tipgroup-submit-button');
    this.errorCard = this.page.getByTestId('error-card');
    this.spinner = this.page.getByTestId('spinner');
  }

  async fillTipgroupDialog(name: string, nthRow: number, password: string) {
    await this.spinner.waitFor({ state: 'hidden' });
    await this.tipgroupNameInput.click();
    await this.tipgroupNameInput.locator('input').fill(name);
    await this.selectLeague(nthRow);
    await this.passwordInput.click();
    await this.passwordInput.locator('input').fill(password);
    await this.passwordConfirmInput.click();
    await this.passwordConfirmInput.locator('input').fill(password);
    await this.tipgroupNameInput.click();
  }

  private async selectLeague(nthRow: number) {
    await this.leagueSelection.click();
    await this.page.locator('.options-container').waitFor({ state: 'visible' });
    await this.page.locator('.options-container .option-item').nth(nthRow).click();
  }

  async submit() {
    await this.createButton.isEnabled();
    await this.createButton.click();
    await this.spinner.waitFor({ state: 'hidden' });
  }

  inputErrorText(inputObject: Locator) {
    return inputObject.locator('.input-error-message');
  }
}
