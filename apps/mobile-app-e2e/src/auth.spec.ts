import {expect} from '@playwright/test';
import {test} from './fixtures/auth.fixture';
import {mockResponse} from './helper/response-helper';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('login button should initially be disabled and show error-messages if input is invalid', async ({
                                                                                                           loginPage,
                                                                                                         }) => {
      await loginPage.passwordInputContainer.isVisible();
      await expect(loginPage.loginButton).toHaveAttribute('disabled');

      // Fill inputs with invalid data
      await loginPage.fillInputs('wrongEmail', '1234');
      await loginPage.emailInputContainer.click();
      await expect(
        loginPage.inputErrorText(loginPage.passwordInputContainer)
      ).toHaveText('Passwort muss mindestens 6 Zeichen lang sein.');
      await expect(
        loginPage.inputErrorText(loginPage.emailInputContainer)
      ).toHaveText('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      await expect(loginPage.loginButton).toHaveAttribute('disabled');
    });

    test('login button should be enabled and redirect to home page on successful login', async ({
                                                                                                  loginPage,
                                                                                                }) => {
      // Fill inputs with valid data
      await loginPage.fillInputs('testEmail@email.de', '123456');
      await loginPage.emailInputContainer.click();
      await expect(
        loginPage.inputErrorText(loginPage.emailInputContainer)
      ).toBeHidden();
      await expect(
        loginPage.inputErrorText(loginPage.passwordInputContainer)
      ).toBeHidden();
      await expect(loginPage.loginButton).not.toHaveAttribute('disabled');

      await loginPage.loginButton.click();
      await expect(loginPage.loginButton.locator('ion-spinner')).toBeVisible();
      await expect(loginPage.page).not.toHaveURL('/auth/login');
    });

    test('should switch to registration page when "Registrieren" button is clicked', async ({
                                                                                              loginPage,
                                                                                            }) => {
      await loginPage.switchToRegisterButton.click();
      await expect(loginPage.page).toHaveURL('/auth/register');
    });

    test('should show error message below input-field if Backend throw Validation-Error', async ({
                                                                                                   loginPage,
                                                                                                   page,
                                                                                                 }) => {
      await mockResponse(page, 'api/auth/login', {
        status: 422,
        body: {
          status: 422,
          message: 'Validation failed.',
          validationMessages: [
            {
              property: 'email',
              constraints: {
                isEmail: 'dummyMessage',
              },
            },
            {
              property: 'password',
              constraints: {
                dummyKey: 'dummyMessage',
              },
            },
          ],
        },
      });

      await loginPage.fillInputs('test@email.de', '123456');
      await loginPage.loginButton.click();

      await expect(
        loginPage.inputErrorText(loginPage.emailInputContainer)
      ).toHaveText('Ungültige E-Mail-Adresse.');
      await expect(
        loginPage.inputErrorText(loginPage.passwordInputContainer)
      ).toHaveText('Ungültige Eingabe.');
    });
  });

  test.describe('Register Page', () => {
    test('register button should initially be disabled and show error-messages if input is invalid', async ({
                                                                                                              registerPage,
                                                                                                            }) => {
      await registerPage.registerButton.isVisible();
      await expect(registerPage.registerButton).toHaveAttribute('disabled');

      // Fill inputs with invalid data
      await registerPage.fillInputs('12', 'wrongEmail', '1234', '12345');
      await registerPage.usernameInputContainer.click();
      await expect(
        registerPage.inputErrorText(registerPage.usernameInputContainer)
      ).toHaveText('Nutzername muss mindestens 3 Zeichen lang sein.');
      await expect(
        registerPage.inputErrorText(registerPage.emailInputContainer)
      ).toHaveText('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      await expect(
        registerPage.inputErrorText(registerPage.passwordInputContainer)
      ).toHaveText('Passwort muss mindestens 6 Zeichen lang sein.');
      await expect(
        registerPage.inputErrorText(registerPage.confirmPasswordInputContainer)
      ).toHaveText('Die Passwörter stimmen nicht überein.');
      await expect(registerPage.registerButton).toHaveAttribute('disabled');
    });

    test('register button should be enabled and redirect to home page on successful registration', async ({
                                                                                                            registerPage,
                                                                                                          }) => {
      // Fill inputs with valid data
      await registerPage.fillInputs(
        'testUsername',
        'testEmail@email.de',
        '123456',
        '123456'
      );
      await registerPage.usernameInputContainer.click();

      await expect(
        registerPage.inputErrorText(registerPage.usernameInputContainer)
      ).toBeHidden();
      await expect(
        registerPage.inputErrorText(registerPage.emailInputContainer)
      ).toBeHidden();
      await expect(
        registerPage.inputErrorText(registerPage.passwordInputContainer)
      ).toBeHidden();
      await expect(
        registerPage.inputErrorText(registerPage.confirmPasswordInputContainer)
      ).toBeHidden();
      await expect(registerPage.registerButton).not.toHaveAttribute('disabled');

      await registerPage.registerButton.click();
      await expect(
        registerPage.registerButton.locator('ion-spinner')
      ).toBeVisible();
      await expect(registerPage.page).not.toHaveURL('/auth/register');
    });

    test('should switch to login page when "Anmelden" button is clicked', async ({
                                                                                   registerPage,
                                                                                 }) => {
      await registerPage.switchToLoginButton.click();
      await expect(registerPage.page).toHaveURL('/auth/login');
    });

    test('should show error message below input-field if Backend throw Validation-Error', async ({
                                                                                                   registerPage,
                                                                                                   page,
                                                                                                 }) => {
      await mockResponse(page, 'api/auth/register', {
        status: 422,
        body: {
          status: 422,
          message: 'Validation failed.',
          validationMessages: [
            {
              property: 'email',
              constraints: {
                isEmail: 'email must be an email',
              },
            },
            {
              property: 'password',
              constraints: {
                dummyKey: 'dummyMessage',
              },
            },
            {
              property: 'username',
              constraints: {
                dummyKey: 'dummyMessage',
              },
            },
          ],
        },
      });

      await registerPage.fillInputs(
        'testUser',
        'test@email.de',
        '123456',
        '123456'
      );
      await registerPage.registerButton.click();

      await expect(
        registerPage.inputErrorText(registerPage.usernameInputContainer)
      ).toHaveText('Ungültige Eingabe.');
      await expect(
        registerPage.inputErrorText(registerPage.emailInputContainer)
      ).toHaveText('Ungültige E-Mail-Adresse.');
      await expect(
        registerPage.inputErrorText(registerPage.passwordInputContainer)
      ).toHaveText('Ungültige Eingabe.');
      await expect(
        registerPage.inputErrorText(registerPage.confirmPasswordInputContainer)
      ).toBeHidden();
    });
  });

  test.describe('Refresh-Flow', () => {
    test('should redirect to login page when refresh token is invalid', async ({
                                                                                 page,
                                                                               }) => {
      // Mock the response for an invalid refresh token
      await mockResponse(page, 'api/auth/refresh', {
        status: 401,
        body: {message: 'Refresh token is invalid'},
      });

      await page.goto('/');
      await page.waitForURL('/auth/login');
      await expect(page).toHaveURL('/auth/login');
    });

    test('should refresh the accessToken and remain on current Page if token is valid', async ({
                                                                                                 page,
                                                                                               }) => {
      await mockResponse(page, 'api/auth/refresh', {
        status: 200,
        body: {accessToken: 'mock-accessToken'},
      });

      await page.goto('');
      await page.waitForURL('');
      await expect(page.getByTestId('header')).toBeVisible()
    });
  });

  test.describe('Error Toast-Notifications', () => {
    test('should show toast with correct message if backend returns specific error-codes', async ({
                                                                                                    loginPage,
                                                                                                    page,
                                                                                                  }) => {
      await mockResponse(page, 'api/auth/login', {
        status: 401,
        body: {
          status: 401,
          message: 'dummyMessage',
          code: 'AUTH.INVALID_CREDENTIALS',
        },
      });

      await loginPage.fillInputs('test@email.de', '123456');
      await loginPage.loginButton.click();
      await expect(loginPage.toastNotification()).toHaveText(
        'Passwort und Nutzername stimmen nicht überein.'
      );
    });

    test('should show toast with correct message if backend returns a unexpected Backend-Error', async ({
                                                                                                          loginPage,
                                                                                                          page,
                                                                                                        }) => {
      await mockResponse(page, 'api/auth/login', {
        status: 401,
        body: {
          status: 401,
          message: 'dummyMessage',
        },
      });

      await loginPage.fillInputs('test@email.de', '123456');
      await loginPage.loginButton.click();
      await expect(loginPage.toastNotification()).toHaveText(
        'Unbekannter Fehler ist aufgetreten. Versuche es später erneut.'
      );
    });
  });
});
