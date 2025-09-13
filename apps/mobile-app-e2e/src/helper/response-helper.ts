import {Page} from '@playwright/test';

export interface ResponseObject {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export async function mockResponse(
  page: Page,
  url: string,
  responseObject: ResponseObject = {
    status: 200,
    body: {},
    headers: {},
  },
  delay = 1000
) {
  await page.route('**/' + url, async (route) => {
    await new Promise((f) => setTimeout(f, delay));
    await route.fulfill({
      status: responseObject.status,
      contentType: 'application/json',
      body: JSON.stringify(responseObject.body),
      headers: responseObject.headers || {},
    });
  });
}

export async function mockRegisterUserResponse(
  page: Page,
  status?: number,
  body?: unknown
) {
  await mockResponse(page, 'api/auth/register', {
    status: status || 200,
    body: body || {accessToken: 'mock-accessToken', refreshToken: 'mock-refreshToken'},
  });
}

export async function mockLoginUserResponse(
  page: Page,
  status?: number,
  body?: unknown
) {
  await mockResponse(page, 'api/auth/login', {
    status: status || 200,
    body: body || {accessToken: 'mock-accessToken', refreshToken: 'mock-refreshToken'},
  });
}

export async function mockRefreshUserResponse(
  page: Page,
  status?: number,
  body?: unknown
) {
  await mockResponse(page, 'api/auth/refresh', {
    status: status || 200,
    body: body || {accessToken: 'mock-accessToken', refreshToken: 'mock-refreshToken'},
  });
}

export async function mockTipgroupListResponse(
  page: Page,
  status?: number,
  body?: unknown
) {
  await mockResponse(page, 'api/user/tipgroups', {
    status: status || 200,
    body: body || [
      {id: 1, name: 'Testgroup1'},
      {id: 2, name: 'Testgroup2'},
      {id: 3, name: 'Testgroup3'},
    ],
  });
}
