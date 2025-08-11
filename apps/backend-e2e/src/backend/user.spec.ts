import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateTipgroupDto, RegisterDto } from '@tippapp/shared/data-access';
import {
  resetMockApi,
  setupE2ETestEnvironment,
  setupMockApi,
  TipgroupFactory,
  UserFactory,
} from '@tippapp/backend/test-helper';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;

  const mocks = {
    get createTipGroupData(): CreateTipgroupDto[] {
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
    userFactory = new UserFactory(app, dataSource);
    tipgroupFactory = new TipgroupFactory(app, dataSource);
  });

  describe('/tipgroups (GET)', () => {
    let accessTokenFirstUser: string;
    beforeEach(async () => {
      await setupMockApi({
        matchDataResponse: [],
        availableGroupsResponse: [],
      });

      // Create two test users
      await userFactory.createUserInDatabase(mocks.registerData[0]);
      await userFactory.createUserInDatabase(mocks.registerData[1]);

      // Login to the first user and get the access token
      accessTokenFirstUser = await userFactory.loginUser(
        mocks.registerData[0].email,
        mocks.registerData[0].password
      );
    });

    it('should return an empty list of tipgroups for a new user', async () => {
      const response = await userFactory.getTipGroups(accessTokenFirstUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return correct Lists for two users after creating tipgroups', async () => {
      // Create 2 Tipgroups for the User1
      await tipgroupFactory.createTipGroup(
        accessTokenFirstUser,
        mocks.createTipGroupData[0]
      );
      await tipgroupFactory.createTipGroup(
        accessTokenFirstUser,
        mocks.createTipGroupData[1]
      );

      // Check if User has 2 tipgroups
      let response = await userFactory.getTipGroups(accessTokenFirstUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'Tipgroup1' },
        { id: 2, name: 'Tipgroup2' },
      ]);

      //Login to other User
      const authTokenForSecondUser = await userFactory.loginUser(
        mocks.registerData[1].email,
        mocks.registerData[1].password
      );

      response = await userFactory.getTipGroups(authTokenForSecondUser);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await resetMockApi();
    await userFactory.clearDatabase();
  });
});
