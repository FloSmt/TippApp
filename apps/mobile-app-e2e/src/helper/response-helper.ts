import {Page} from "@playwright/test";

export interface ResponseObject {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export async function mockResponse(page: Page, url: string, responseObject: ResponseObject = {
  status: 200,
  body: {},
  headers: {}
}, delay = 1000) {
  await page.route('**/' + url, async (route) => {
    await new Promise(f => setTimeout(f, delay));
    await route.fulfill({
      status: responseObject.status,
      contentType: 'application/json',
      body: JSON.stringify(responseObject.body),
      headers: responseObject.headers || {}
    });
  })
}
