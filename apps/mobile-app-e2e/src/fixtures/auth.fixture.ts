import {test as base} from '@playwright/test';
import {LoginPage} from "../page-objects/login.po";
import {mockResponse} from "../helper/response-helper";
import {RegisterPage} from "../page-objects/register.po";

type AuthFixture = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
}

export const test = base.extend<AuthFixture>({
  loginPage: async ({page}, use) => {
    const loginPage = new LoginPage(page);

    await mockResponse(page, 'api/auth/login', {
      status: 200,
      body: {accessToken: 'mock-accessToken'},
      headers: {
        'Set-Cookie': 'refreshToken=mocked-refreshToken; Path=/; HttpOnly'
      }
    })

    await loginPage.goto();

    await use(loginPage);
  },

  registerPage: async ({page}, use) => {
    const registerPage = new RegisterPage(page);

    await mockResponse(page, 'api/auth/register', {
      status: 200,
      body: {accessToken: 'mock-accessToken'},
      headers: {
        'Set-Cookie': 'refreshToken=mocked-refreshToken; Path=/; HttpOnly'
      }
    })

    await registerPage.goto();
    await use(registerPage);
  }
})
