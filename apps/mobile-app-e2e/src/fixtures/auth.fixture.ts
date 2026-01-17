import { test as base } from '@playwright/test';
import { LoginPage } from '../e2e/auth/login.po';
import { RegisterPage } from '../e2e/auth/register.po';

type AuthFixture = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
};

export const test = base.extend<AuthFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await use(registerPage);
  },
});
