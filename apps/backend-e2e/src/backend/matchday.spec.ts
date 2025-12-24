import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  MatchdayFactory,
  setupE2ETestEnvironment,
  setupMockApi,
  TipgroupFactory,
  UserFactory,
} from '@tippapp/backend/test-helper';

describe('MatchdayController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;
  let matchdayFactory: MatchdayFactory;

  let accessToken: string;
  let tipgroupId: number;

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    userFactory = new UserFactory(app, dataSource);
    tipgroupFactory = new TipgroupFactory(app, dataSource);
    matchdayFactory = new MatchdayFactory(app, dataSource);
  });

  beforeEach(async () => {
    await setupMockApi();
    accessToken = await userFactory.prepareUserAndLogin();
    tipgroupId = await tipgroupFactory.prepareTipgroupAndGetId(accessToken);
  });

  describe('GET /tipgroups/:tipgroupId/seasons/:seasonId/matchday/:matchdayId', () => {
    it('should return 200 and matchday details', async () => {
      const matchdayId = 1;
      const seasonId = 1;

      const response = await matchdayFactory
        .setParameters(tipgroupId, seasonId, matchdayId)
        .getMatchdayDetails(accessToken);

      expect(response.status).toBe(200);
      console.log(response.body);
      expect(response.body).toBeDefined();
      expect(response.body.matches).toBeDefined();
      expect(response.body.matchdayId).toStrictEqual(matchdayId.toString());
      expect(Array.isArray(response.body.matches)).toBe(true);
    });

    it('should return 404 when matchday not found', async () => {
      const matchdayId = 9999; // Non-existing matchday
      const seasonId = 1;

      const response = await matchdayFactory
        .setParameters(tipgroupId, seasonId, matchdayId)
        .getMatchdayDetails(accessToken);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.code).toBe('TIPGROUP.MATCHDAY_DETAILS_NOT_FOUND');
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await tipgroupFactory.clearDatabase();
  });
});
