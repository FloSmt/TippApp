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

describe('SeasonController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;

  let accessToken: string;
  let tipgroupId: number;

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

  describe('GET /tipgroups/:tipgroupId/seasons/:seasonId/getAllMatchdays', () => {
    it('should return 200 and matchday list', async () => {
      const response = await request(app.getHttpServer())
        .get(API_ROUTES.TIPGROUP.SEASON.GET_ALL_MATCHDAYS(tipgroupId, 1))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('matchdayId');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('orderId');
      expect(response.body[0]).toHaveProperty('matchCount');
    });

    it('should return 404 when given parameters are missing', async () => {
      const response = await request(app.getHttpServer())
        .get(API_ROUTES.TIPGROUP.SEASON.GET_ALL_MATCHDAYS(tipgroupId, 'xx' as any))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.code).toBe('TIPGROUP.SEASON_NOT_FOUND');
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await tipgroupFactory.clearDatabase();
  });
});
