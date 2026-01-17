import { mockServerClient } from 'mockserver-client';
import { AVAILABLE_GROUPS_MOCK, AVAILABLE_LEAGUES_MOCK, MATCHDATA_MOCK } from '../api-mocks';

export interface MockApiOptions {
  matchDataResponse?: any;
  availableGroupsResponse?: any;
  availableLeaguesResponse?: any;
  lastChangeDateResponse?: any;
  errorCode?: number | undefined;
}

export const resetMockApi = async () => {
  const client = mockServerClient('localhost', 1080);
  await client.reset();
};

export const setupMockApi = async (
  options: MockApiOptions = {
    matchDataResponse: MATCHDATA_MOCK,
    availableGroupsResponse: AVAILABLE_GROUPS_MOCK,
    availableLeaguesResponse: AVAILABLE_LEAGUES_MOCK,
    lastChangeDateResponse: '2024-01-01T00:00:00Z',
    errorCode: 200,
  }
) => {
  const optionsWithDefaults: MockApiOptions = {
    matchDataResponse: options.matchDataResponse || MATCHDATA_MOCK,
    availableGroupsResponse: options.availableGroupsResponse || AVAILABLE_GROUPS_MOCK,
    availableLeaguesResponse: options.availableLeaguesResponse || AVAILABLE_LEAGUES_MOCK,
    lastChangeDateResponse: options.lastChangeDateResponse || '2024-01-01T00:00:00Z',
    errorCode: options.errorCode || 200,
  };
  const client = mockServerClient('localhost', 1080);

  await client.reset();

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getmatchdata/.*',
    },
    httpResponse: {
      statusCode: optionsWithDefaults.errorCode,
      body: JSON.stringify(optionsWithDefaults.matchDataResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getlastchangedate/.*',
    },
    httpResponse: {
      statusCode: optionsWithDefaults.errorCode,
      body: JSON.stringify(optionsWithDefaults.lastChangeDateResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getavailableleagues/',
    },
    httpResponse: {
      statusCode: optionsWithDefaults.errorCode,
      body: JSON.stringify(optionsWithDefaults.availableLeaguesResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getavailablegroups/.*',
    },
    httpResponse: {
      statusCode: optionsWithDefaults.errorCode,
      body: JSON.stringify(optionsWithDefaults.availableGroupsResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });
};
