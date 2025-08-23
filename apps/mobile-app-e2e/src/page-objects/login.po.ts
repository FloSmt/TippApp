import {Locator, Page} from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  readonly emailInputContainer: Locator;
  readonly passwordInputContainer: Locator;
  readonly loginButton: Locator;
  readonly switchToRegisterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInputContainer = page.locator('ion-input[type="email"]');
    this.passwordInputContainer = page.getByTestId('input-password')
    this.loginButton = this.page.getByTestId('login-button');
    this.switchToRegisterButton = this.page.getByTestId('switch-to-register-button');
  }

  async goto() {
    await this.page.goto('auth/login');
  }

  async fillInputs(email: string, password: string) {
    await this.emailInputContainer.locator('input').fill(email);
    await this.passwordInputContainer.click();
    await this.passwordInputContainer.locator('.native-input').first().fill(password);
  }

  inputErrorText(inputObject: Locator) {
    return inputObject.locator('.error-text');
  }

  toastNotification() {
    return this.page.locator('ion-toast');
  }
}
