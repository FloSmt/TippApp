import { mockServerClient } from 'mockserver-client';
import {
  AVAILABLE_GROUPS_MOCK,
  AVAILABLE_LEAGUES_MOCK,
  MATCHDATA_MOCK,
} from '../api-mocks';

export interface MockApiOptions {
  matchDataResponse?: any;
  availableGroupsResponse?: any;
  availableLeaguesResponse?: any;
  errorCode?: number | undefined;
}

export const resetMockApi = async () => {
  const client = mockServerClient('localhost', 1080);
  console.log('Resetting mock server...');
  await client.reset();
};

export const setupMockApi = async (
  options: MockApiOptions = {
    matchDataResponse: MATCHDATA_MOCK,
    availableGroupsResponse: AVAILABLE_GROUPS_MOCK,
    availableLeaguesResponse: AVAILABLE_LEAGUES_MOCK,
    errorCode: 200,
  }
) => {
  const optionsWithDefaults: MockApiOptions = {
    matchDataResponse: options.matchDataResponse || MATCHDATA_MOCK,
    availableGroupsResponse:
      options.availableGroupsResponse || AVAILABLE_GROUPS_MOCK,
    availableLeaguesResponse:
      options.availableLeaguesResponse || AVAILABLE_LEAGUES_MOCK,
    errorCode: options.errorCode || 200,
  };
  const client = mockServerClient('localhost', 1080);

  console.log('Setting up mock server...');
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

  console.log('Mock server setup complete.');
};
