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
  registerMultipleUsers,
  setupE2ETestEnvironment,
  setupMockApi,
  TestApi,
} from '@tippapp/backend/test-helper';

describe('TipgroupController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testApi: TestApi;

  let tipgroupRepository: Repository<Tipgroup>;
  let tipseasonRepository: Repository<TipSeason>;
  let matchdayRepository: Repository<Matchday>;
  let matchRepository: Repository<Match>;
  let tipgroupUserRepository: Repository<TipgroupUser>;

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
      ];
    },

    get registerData(): RegisterDto[] {
      return [
        {
          username: 'test',
          email: 'test@email.de',
          password: '1234',
        },
      ];
    },
  };

  beforeAll(async () => {
    await setupMockApi();
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    testApi = setup.testApi;

    tipgroupRepository = dataSource.getRepository(Tipgroup);
    tipseasonRepository = dataSource.getRepository(TipSeason);
    matchdayRepository = dataSource.getRepository(Matchday);
    matchRepository = dataSource.getRepository(Match);
    tipgroupUserRepository = dataSource.getRepository(TipgroupUser);

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

  describe('/create (POST)', () => {
    it('should create tipgroup, tipseason, matchdays and matches', async () => {
      const response = await testApi.createTipgroup(
        mocks.createTipgroupData[0],
        authToken
      );
      expect(response.status).toBe(201);

      // Check if user is set
      const tipgroupUser: TipgroupUser[] = await tipgroupUserRepository.find();
      expect(tipgroupUser.length).toBe(1);
      expect(tipgroupUser[0].userId).toEqual(testUser[0].id);
      expect(tipgroupUser[0].isAdmin).toBeTruthy();
      expect(tipgroupUser[0].tipgroupId).toEqual(response.body.id);

      // Check if Tipgroup has all Atributes
      const tipgroups: Tipgroup[] = await tipgroupRepository.find();
      expect(tipgroups.length).toBe(1);
      expect(tipgroups[0].name).toEqual(mocks.createTipgroupData[0].name);
      expect(tipgroups[0].passwordHash).toEqual(
        mocks.createTipgroupData[0].passwordHash
      );

      // Check if TipSeason was created
      const tipSeasons: TipSeason[] = await tipseasonRepository.find();
      expect(tipSeasons.length).toBe(1);
      expect(tipSeasons[0].api_LeagueSeason).toEqual(
        mocks.createTipgroupData[0].currentSeason
      );

      // Check if Matchdays were created
      const matchdays: Matchday[] = await matchdayRepository.find();
      expect(matchdays.length).toBe(AVAILABLE_GROUPS_MOCK.length);
      expect(matchdays[0].name).toEqual(AVAILABLE_GROUPS_MOCK[0].groupName);
      expect(matchdays[0].api_groupId).toEqual(
        AVAILABLE_GROUPS_MOCK[0].groupID
      );

      // Check if Matches were created
      const matches: Match[] = await matchRepository.find();
      expect(matches.length).toBe(MATCHDATA_MOCK.length);
      expect(matches[0].api_matchId).toEqual(MATCHDATA_MOCK[0].matchID);
    });

    it('should throw Error 401 if user is not authorized', async () => {
      const response = await testApi.createTipgroup(
        mocks.createTipgroupData[0],
        'wrongToken'
      );

      expect(response.status).toBe(401);
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
