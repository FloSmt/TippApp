import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  readonly usernameInputContainer: Locator;
  readonly emailInputContainer: Locator;
  readonly passwordInputContainer: Locator;
  readonly confirmPasswordInputContainer: Locator;
  readonly registerButton: Locator;
  readonly switchToLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInputContainer = page.getByTestId('input-email');
    this.usernameInputContainer = page.getByTestId('input-username');
    this.confirmPasswordInputContainer = page.getByTestId(
      'input-confirm-password'
    );
    this.passwordInputContainer = page.getByTestId('input-password');
    this.registerButton = this.page.getByTestId('register-button');
    this.switchToLoginButton = this.page.getByTestId('switch-to-login-button');
  }

  async goto() {
    await this.page.goto('auth/register');
  }

  async fillInputs(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    await this.usernameInputContainer.locator('input').fill(username);
    await this.emailInputContainer.click();
    await this.emailInputContainer.locator('input').fill(email);
    await this.passwordInputContainer.click();
    await this.passwordInputContainer
      .locator('.native-input')
      .first()
      .fill(password);
    await this.confirmPasswordInputContainer.click();
    await this.confirmPasswordInputContainer
      .locator('.native-input')
      .first()
      .fill(confirmPassword);
  }

  inputErrorText(inputObject: Locator) {
    return inputObject.locator('.error-text');
  }

  toastNotification() {
    return this.page.locator('ion-toast');
  }
}
