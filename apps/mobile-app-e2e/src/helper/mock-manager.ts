import { Page } from '@playwright/test';
import { AuthResponseDto, TipgroupOverviewResponseDto } from '@tippapp/shared/data-access';
import { availableLeaguesMockResponse } from './responses';

type Method = 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT';

interface MockConfig {
  status: number;
  body: any;
  headers?: Record<string, string>;
  delay?: number;
}

const routeRegistry = new Map<string, Map<Method, MockConfig>>();

export async function mockResponse(page: Page, method: Method, url: string, config: MockConfig) {
  const pattern = `**/${url}`;

  if (!routeRegistry.has(pattern)) {
    routeRegistry.set(pattern, new Map());

    await page.route(pattern, async (route) => {
      const m = route.request().method() as Method;
      const handlers = routeRegistry.get(pattern);
      const handler = handlers?.get(m);

      if (handler) {
        await new Promise((r) => setTimeout(r, handler.delay || 300));
        return route.fulfill({
          status: handler.status,
          contentType: 'application/json',
          body: JSON.stringify(handler.body),
        });
      }
      return route.fallback();
    });
  }

  routeRegistry.get(pattern).set(method, config);
}

export function clearMocks() {
  routeRegistry.clear();
}

export const DEFAULT_RESPONSES = {
  authResponseSuccess: {
    status: 200,
    body: { accessToken: 'abc', refreshToken: 'xyz' } satisfies AuthResponseDto,
  },
  availableLeaguesResponseSuccess: {
    status: 200,
    body: availableLeaguesMockResponse,
  },
  tipgroupOverviewResponseSuccess: {
    status: 200,
    body: [
      { id: 1, name: 'Testgroup1', currentSeasonId: 1 },
      { id: 2, name: 'Testgroup2', currentSeasonId: 2 },
      { id: 3, name: 'Testgroup3', currentSeasonId: 3 },
    ] satisfies TipgroupOverviewResponseDto[],
  },
};

export async function mockRegisterUser(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'POST', 'api/auth/register', {
    ...DEFAULT_RESPONSES.authResponseSuccess,
    ...overrides,
  });
}

export async function mockLoginUser(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'POST', 'api/auth/login', {
    ...DEFAULT_RESPONSES.authResponseSuccess,
    ...overrides,
  });
}

export async function mockRefreshUser(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'POST', 'api/auth/refresh', {
    ...DEFAULT_RESPONSES.authResponseSuccess,
    ...overrides,
  });
}

export async function mockAvailableLeagues(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'GET', 'api/tipgroups/getAvailableLeagues', {
    ...DEFAULT_RESPONSES.availableLeaguesResponseSuccess,
    ...overrides,
  });
}

export async function mockTipgroupList(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'GET', 'api/tipgroups', {
    ...DEFAULT_RESPONSES.tipgroupOverviewResponseSuccess,
    ...overrides,
  });
}

export async function mockTipgroupCreate(page: Page, overrides?: Partial<MockConfig>) {
  await mockResponse(page, 'POST', 'api/tipgroups', {
    ...DEFAULT_RESPONSES.tipgroupOverviewResponseSuccess[0],
    ...overrides,
  });
}
