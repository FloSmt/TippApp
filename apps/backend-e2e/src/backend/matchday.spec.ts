import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  API_ROUTES,
  MATCHDATA_MOCK,
  MatchdayFactory,
  resetMockApi,
  setupE2ETestEnvironment,
  setupMockApi,
  TipgroupFactory,
  UserFactory,
} from '@tippapp/backend/test-helper';
import request from 'supertest';
import { Match } from '@tippapp/shared/data-access';

describe('MatchdayController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;
  let matchdayFactory: MatchdayFactory;

  let accessToken: string;

  let matchRepository: Repository<Match>;

  let tipgroupId: number;
  const seasonId = 1;
  const matchdayId = 1;

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    userFactory = new UserFactory(app, dataSource);
    tipgroupFactory = new TipgroupFactory(app, dataSource);
    matchdayFactory = new MatchdayFactory(app, dataSource);

    matchRepository = dataSource.getRepository<Match>(Match);
  });

  describe('GET /tipgroups/:tipgroupId/seasons/:seasonId/matchday/:matchdayId', () => {
    describe('', () => {
      beforeEach(async () => {
        await setupMockApi();
        accessToken = await userFactory.prepareUserAndLogin();
        tipgroupId = await tipgroupFactory.prepareTipgroupAndGetId(accessToken);
      });

      it('should return 200 and matchday details', async () => {
        const response = await request(app.getHttpServer())
          .get(API_ROUTES.TIPGROUP.MATCHDAY.GET_DETAILS(tipgroupId, seasonId, matchdayId))
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.matchList).toBeDefined();
        expect(response.body.matchdayId).toStrictEqual(matchdayId);
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

    describe('', () => {
      const initialUpdateDate = new Date('2025-12-12T00:00:00Z');

      beforeEach(async () => {
        await setupMockApi({
          matchDataResponse: [
            {
              ...MATCHDATA_MOCK[0],
              lastUpdateDateTime: initialUpdateDate,
              matchResults: [{ pointsTeam1: null, pointsTeam2: null }],
            },
          ],
        });

        accessToken = await userFactory.prepareUserAndLogin();
        tipgroupId = await tipgroupFactory.prepareTipgroupAndGetId(accessToken);

        // Check that the match is saved in the database with the initial API response
        const savedMatches = await matchRepository.findOneBy({ api_matchId: MATCHDATA_MOCK[0].matchID });
        expect(savedMatches).toBeTruthy();
        expect(savedMatches.scoreAway).toBeNull();
        expect(savedMatches.scoreHome).toBeNull();
        expect(savedMatches.lastApiUpdateDate.getTime()).toBe(initialUpdateDate.getTime());
      });

      it('should update database matches if a new version is sent from the api', async () => {
        // Setup the mock API to return a new version of the match data with updated scores and a later lastUpdateDateTime
        await resetMockApi();
        await setupMockApi({
          matchDataResponse: [
            {
              ...MATCHDATA_MOCK[0],
              lastUpdateDateTime: new Date('2025-12-13T00:00:00Z'),
              matchResults: [{ pointsTeam1: 1, pointsTeam2: 2 }],
            },
          ],
        });

        // Call the endpoint again to trigger the update logic
        await matchdayFactory.setParameters(tipgroupId, seasonId, matchdayId).getMatchdayDetails(accessToken);

        // Check that the match in the database has been updated with the new scores and lastApiUpdateDate
        const newSavedMatch = await matchRepository.findOneBy({ api_matchId: MATCHDATA_MOCK[0].matchID });
        expect(newSavedMatch).toBeTruthy();
        expect(newSavedMatch.scoreAway).toBe(2);
        expect(newSavedMatch.lastApiUpdateDate.getTime()).toBe(new Date('2025-12-13T00:00:00Z').getTime());
      });

      it('should not update database matches if latestUpdateDate is equal', async () => {
        // return equal lastUpdateDateTime but different scores
        await setupMockApi({
          matchDataResponse: [
            {
              ...MATCHDATA_MOCK[0],
              lastUpdateDateTime: initialUpdateDate,
              matchResults: [{ pointsTeam1: 1, pointsTeam2: 2 }],
            },
          ],
        });

        await matchdayFactory.setParameters(tipgroupId, seasonId, matchdayId).getMatchdayDetails(accessToken);

        // Check that the match in the database has not been updated
        const newSavedMatch = await matchRepository.findOneBy({ api_matchId: MATCHDATA_MOCK[0].matchID });
        expect(newSavedMatch).toBeTruthy();
        expect(newSavedMatch.scoreAway).toBeNull();
        expect(newSavedMatch.scoreHome).toBeNull();
        expect(newSavedMatch.lastApiUpdateDate.getTime()).toBe(initialUpdateDate.getTime());
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    tipgroupFactory.clearApiServiceCache(app);
    await tipgroupFactory.clearDatabase();
  });
});
