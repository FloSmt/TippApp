import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  API_ROUTES,
  setupE2ETestEnvironment,
  setupMockApi,
  TipgroupFactory,
  UserFactory,
} from '@tippapp/backend/test-helper';
import request from 'supertest';

describe('MatchdayController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;

  let accessToken: string;

  let tipgroupId: number;
  const seasonId = 1;
  const matchdayId = 1;

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    userFactory = new UserFactory(app, dataSource);
    tipgroupFactory = new TipgroupFactory(app, dataSource);
  });

  beforeEach(async () => {
    await setupMockApi();
    accessToken = await userFactory.prepareUserAndLogin();
    tipgroupId = await tipgroupFactory.prepareTipgroupAndGetId(accessToken);
  });

  describe('GET /tipgroups/:tipgroupId/seasons/:seasonId/matchday/:matchdayId', () => {
    it('should return 200 and matchday details', async () => {
      const response = await request(app.getHttpServer())
        .get(API_ROUTES.TIPGROUP.MATCHDAY.GET_DETAILS(tipgroupId, seasonId, matchdayId))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.matchList).toBeDefined();
      expect(response.body.matchdayId).toStrictEqual(matchdayId.toString());
      expect(Array.isArray(response.body.matchList)).toBe(true);
    });

    it('should return 404 when matchday not found', async () => {
      const response = await request(app.getHttpServer())
        .get(API_ROUTES.TIPGROUP.MATCHDAY.GET_DETAILS(tipgroupId, seasonId, 9999))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.code).toBe('TIPGROUP.MATCHDAY_DETAILS_NOT_FOUND');
    });

    it('should throw error if user is not a member of the tipgroup (IsTipgroupMemberGuard)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_ROUTES.TIPGROUP.MATCHDAY.GET_DETAILS(9999, seasonId, matchdayId))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toBeDefined();
      expect(response.body.code).toBe('TIPGROUP.NOT_A_MEMBER');
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await tipgroupFactory.clearDatabase();
  });
});
