import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  CreateTipgroupDto,
  Match,
  Matchday,
  RegisterDto,
  Tipgroup,
  TipgroupUser,
  TipSeason,
  User,
} from '@tippapp/shared/data-access';
import {
  AVAILABLE_GROUPS_MOCK,
  MATCHDATA_MOCK,
  setupE2ETestEnvironment,
  setupMockApi,
  TipgroupFactory,
  UserFactory,
} from '@tippapp/backend/test-helper';
import * as bcrypt from 'bcrypt';

describe('TipgroupController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;
  let tipgroupFactory: TipgroupFactory;

  let tipgroupRepository: Repository<Tipgroup>;
  let tipseasonRepository: Repository<TipSeason>;
  let matchdayRepository: Repository<Matchday>;
  let matchRepository: Repository<Match>;
  let tipgroupUserRepository: Repository<TipgroupUser>;

  const mocks = {
    get createTipgroupData(): CreateTipgroupDto[] {
      return [
        {
          name: 'Tipgroup1',
          password: 'password',
          leagueShortcut: 'bl1',
          currentSeason: 2007,
        },
        {
          name: 'Tipgroup2',
          password: 'password',
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

    tipgroupRepository = dataSource.getRepository(Tipgroup);
    tipseasonRepository = dataSource.getRepository(TipSeason);
    matchdayRepository = dataSource.getRepository(Matchday);
    matchRepository = dataSource.getRepository(Match);
    tipgroupUserRepository = dataSource.getRepository(TipgroupUser);
  });

  describe('POST /tipgroups', () => {
    let testUser: User;
    let accessToken: string;

    beforeEach(async () => {
      await setupMockApi();
      testUser = await userFactory.createUserInDatabase(mocks.registerData[0]);
      accessToken = await userFactory.loginUser(mocks.registerData[0].email, mocks.registerData[0].password);
    });

    it('should create matchday, tipseason, matchday and matches', async () => {
      const response = await tipgroupFactory.createTipGroupWithRest(accessToken, mocks.createTipgroupData[0]);

      expect(response.status).toBe(201);

      // Check if user is set
      const tipgroupUser: TipgroupUser[] = await tipgroupUserRepository.find();
      expect(tipgroupUser.length).toBe(1);
      expect(tipgroupUser[0].userId).toEqual(testUser.id);
      expect(tipgroupUser[0].isAdmin).toBeTruthy();
      expect(tipgroupUser[0].tipgroupId).toEqual(response.body.id);

      // Check if Tipgroup has all Atributes
      const tipgroups: Tipgroup[] = await tipgroupRepository.find();
      expect(tipgroups.length).toBe(1);
      expect(tipgroups[0].name).toEqual(mocks.createTipgroupData[0].name);
      const correctPassword = await bcrypt.compare(mocks.createTipgroupData[0].password, tipgroups[0].passwordHash);
      expect(correctPassword).toBeTruthy();

      // Check if TipSeason was created
      const tipSeasons: TipSeason[] = await tipseasonRepository.find();
      expect(tipSeasons.length).toBe(1);
      expect(tipSeasons[0].api_LeagueSeason).toEqual(mocks.createTipgroupData[0].currentSeason);

      // Check if Matchdays were created
      const matchdays: Matchday[] = await matchdayRepository.find();
      expect(matchdays.length).toBe(AVAILABLE_GROUPS_MOCK.length);
      expect(matchdays[0].name).toEqual(AVAILABLE_GROUPS_MOCK[0].groupName);
      expect(matchdays[0].api_groupOrderId).toEqual(AVAILABLE_GROUPS_MOCK[0].groupOrderID);

      // Check if Matches were created
      const matches: Match[] = await matchRepository.find();
      expect(matches.length).toBe(MATCHDATA_MOCK.length);
      expect(matches[0].api_matchId).toEqual(MATCHDATA_MOCK[0].matchID);
    });

    it('should throw Error 401 if user is not authorized', async () => {
      const response = await tipgroupFactory.createTipGroupWithRest('wrongToken', mocks.createTipgroupData[0]);

      expect(response.status).toBe(401);
    });

    it('should trow Error 404 if the user is not found', async () => {
      await userFactory.deleteUserFromDatabase(testUser.id);
      const response = await tipgroupFactory.createTipGroupWithRest(accessToken, mocks.createTipgroupData[0]);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User not found.');
      expect(response.body.code).toBe('USER.USER_NOT_FOUND');
    });

    it('should trow Error 409 if the matchday name is already taken', async () => {
      // Create first Tipgroup
      await tipgroupFactory.createTipGroupInDatabase(mocks.createTipgroupData[0].name);

      // Try to create second Tipgroup with the same name
      const response = await tipgroupFactory.createTipGroupWithRest(accessToken, mocks.createTipgroupData[0]);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('The matchday name is already taken.');
      expect(response.body.code).toBe('CREATE_TIPGROUP.TIPGROUP_NAME_TAKEN');
    });

    it('should trow Error 404 if the submitted leagues wasnt found', async () => {
      const response = await tipgroupFactory.createTipGroupWithRest(accessToken, {
        ...mocks.createTipgroupData[0],
        leagueShortcut: 'wrongLeague',
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('The referenced league was not found.');
      expect(response.body.code).toBe('CREATE_TIPGROUP.LEAGUE_NOT_FOUND');
    });
  });

  describe('GET /tipgroups', () => {
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
      accessTokenFirstUser = await userFactory.loginUser(mocks.registerData[0].email, mocks.registerData[0].password);
    });

    it('should return an empty list of tipgroups for a new user', async () => {
      const response = await tipgroupFactory.getTipGroupsOfUser(accessTokenFirstUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return correct Lists for two users after creating tipgroups', async () => {
      // Create 2 Tipgroups for the User1
      await tipgroupFactory.createTipGroupWithRest(accessTokenFirstUser, mocks.createTipgroupData[0]);
      await tipgroupFactory.createTipGroupWithRest(accessTokenFirstUser, mocks.createTipgroupData[1]);

      // Check if User has 2 tipgroups
      let response = await tipgroupFactory.getTipGroupsOfUser(accessTokenFirstUser);

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

      response = await tipgroupFactory.getTipGroupsOfUser(authTokenForSecondUser);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await tipgroupFactory.clearDatabase();
  });
});
