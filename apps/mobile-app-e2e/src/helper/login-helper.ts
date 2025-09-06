import {Page} from "@playwright/test";
import {mockResponse} from "./response-helper";

export async function setLoginContent(page: Page) {
  await mockResponse(page, 'api/auth/refresh', {
    status: 200,
    body: {accessToken: 'mock-accessToken'},
  });
}
