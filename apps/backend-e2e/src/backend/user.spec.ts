import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateTipgroupDto, RegisterDto } from '@tippapp/shared/data-access';
import {
  Match,
  Matchday,
  Tipgroup,
  TipgroupUser,
  TipSeason,
  User,
} from '@tippapp/backend/database';
import {
  registerMultipleUsers,
  setupE2ETestEnvironment,
} from './helper/setup-tests';
import { setupMockApi } from './helper/mockserver.helper';
import { TestApi } from './helper/test-utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testApi: TestApi;

  let authToken: string;
  let testUser: User[];

  const mocks = {
    get createTipgroupData(): CreateTipgroupDto[] {
      return [
        {
          name: 'Tipgroup1',
          passwordHash: 'password',
          leagueShortcut: 'bl1',
          currentSeason: 2024,
        },
        {
          name: 'Tipgroup2',
          passwordHash: 'password',
          leagueShortcut: 'bl1',
          currentSeason: 2024,
        },
      ];
    },
    get registerData(): RegisterDto[] {
      return [
        {
          username: 'test',
          email: 'test@email.de',
          password: '1234',
        },
        {
          username: 'test2',
          email: 'test2@email.de',
          password: '1234',
        },
      ];
    },
  };

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    testApi = setup.testApi;

    testUser = await registerMultipleUsers(
      mocks.registerData,
      setup.userRepository,
      setup.authService
    );
    authToken = await testApi.loginAndGetToken(
      mocks.registerData[0].email,
      mocks.registerData[0].password
    );
  });

  describe('/tipgroups (GET)', () => {
    beforeEach(async () => {
      await setupMockApi({
        matchDataResponse: [],
        availableGroupsResponse: [],
      });
    });

    it('should return an empty list of tipgroups for a new user', async () => {
      const response = await testApi.getTipgroups(authToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return correct Lists for two users after creating tipgroups', async () => {
      // Create 2 Tipgroups for the User
      await testApi.createTipgroup(mocks.createTipgroupData[0], authToken);
      await testApi.createTipgroup(mocks.createTipgroupData[1], authToken);

      // Check if User has 2 tipgroups
      let response = await testApi.getTipgroups(authToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'Tipgroup1' },
        { id: 2, name: 'Tipgroup2' },
      ]);

      //Login to other User
      const authTokenForSecondUser = await testApi.loginAndGetToken(
        mocks.registerData[1].email,
        mocks.registerData[1].password
      );

      response = await testApi.getTipgroups(authTokenForSecondUser);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clear Database Table after Test
    await dataSource.createQueryBuilder().delete().from(TipgroupUser).execute();
    await dataSource.createQueryBuilder().delete().from(Tipgroup).execute();
    await dataSource.createQueryBuilder().delete().from(TipSeason).execute();
    await dataSource.createQueryBuilder().delete().from(Matchday).execute();
    await dataSource.createQueryBuilder().delete().from(Match).execute();
  });
});
