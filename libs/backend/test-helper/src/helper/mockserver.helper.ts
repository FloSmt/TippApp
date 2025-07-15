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

export const setupMockApi = async (
  options: MockApiOptions = {
    matchDataResponse: MATCHDATA_MOCK,
    availableGroupsResponse: AVAILABLE_GROUPS_MOCK,
    availableLeaguesResponse: AVAILABLE_LEAGUES_MOCK,
    errorCode: undefined,
  }
) => {
  const client = mockServerClient('localhost', 1080);

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getmatchdata/.*',
    },
    httpResponse: {
      statusCode: options.errorCode ?? 200,
      body: JSON.stringify(options.matchDataResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getavailableleagues/',
    },
    httpResponse: {
      statusCode: options.errorCode ?? 200,
      body: JSON.stringify(options.availableLeaguesResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getavailablegroups/.*',
    },
    httpResponse: {
      statusCode: options.errorCode ?? 200,
      body: JSON.stringify(options.availableGroupsResponse),
      headers: [{ name: 'Content-Type', values: ['application/json'] }],
    },
  });
};
