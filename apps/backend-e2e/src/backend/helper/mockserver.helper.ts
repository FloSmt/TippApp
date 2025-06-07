import {mockServerClient} from 'mockserver-client';
import {MATCHDATA_MOCK} from "../api-mocks/getMatchData.mock";
import {AVAILABLE_GROUPS_MOCK} from "../api-mocks/getAvailableGroups.mock";

export const setupMockApi = async () => {
  const client = mockServerClient('localhost', 1080);

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getmatchdata/.*',
    },
    httpResponse: {
      statusCode: 200,
      body: JSON.stringify(MATCHDATA_MOCK),
      headers: [
        { name: 'Content-Type', values: ['application/json'] }
      ]
    },
  });

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getavailablegroups/.*',
    },
    httpResponse: {
      statusCode: 200,
      body: JSON.stringify(AVAILABLE_GROUPS_MOCK),
      headers: [
        {name: 'Content-Type', values: ['application/json']}
      ]
    },
  });
};
