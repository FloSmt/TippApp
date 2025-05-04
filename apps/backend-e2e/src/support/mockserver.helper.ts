import { mockServerClient } from 'mockserver-client';

export const setupMockApi = async () => {
  const client = mockServerClient('localhost', 1080);

  await client.mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: '/getmatchdata/',
    },
    httpResponse: {
      statusCode: 200,
      body: JSON.stringify({ name: 'Mocked Name', value: 42 }),
      headers: [
        { name: 'Content-Type', values: ['application/json'] }
      ]
    },
  });
};
