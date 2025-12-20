import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateTipgroupDto, ErrorCodes, Tipgroup, TipgroupUser, TipSeason, User } from '@tippapp/shared/data-access';
import { ApiService, LeaguesResponseMock, MatchResponseMock } from '@tippapp/backend/api';
import { UserService } from '@tippapp/backend/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HashService } from '@tippapp/backend/shared';
import { Repository } from 'typeorm';
import { TipgroupsService } from './tipgroups.service';
import { SeasonService } from './season';

describe('TipgroupsService', () => {
  let service: TipgroupsService;
  let tipSeasonService: DeepMocked<SeasonService>;
  let apiService: DeepMocked<ApiService>;
  let userService: DeepMocked<UserService>;
  let hashService: DeepMocked<HashService>;
  let errorManagerService: DeepMocked<ErrorManagerService>;
  let tipgroupUserRepository: DeepMocked<Repository<TipgroupUser>>;

  const mockTransactionalEntityManager = {
    create: jest.fn().mockImplementation((entity, plainObject) => {
      return { ...plainObject, constructor: { name: entity.name } };
    }),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockTransaction = jest.fn().mockImplementation(async (callback) => {
    return await callback(mockTransactionalEntityManager);
  });

  const mockTipgroupRepository = {
    manager: {
      transaction: mockTransaction,
    },
  };

  const mocks = {
    get createTipgroupDtoMocks() {
      return [
        {
          name: 'Tipgroup1',
          leagueShortcut: 'l1',
          currentSeason: 2022,
          password: '212',
        },
        {
          name: 'Tipgroup1',
          leagueShortcut: 'leagueNotExists',
          currentSeason: 2022,
          password: '212',
        },
      ] as CreateTipgroupDto[];
    },

    get userMock() {
      return {
        id: 1,
        username: 'user',
        email: 'test@test.de',
        password: 'password',
      } as User;
    },

    get tipgroupUserMock() {
      return {
        user: this.userMock,
        userId: this.userMock.id,
        isAdmin: true,
      } as unknown as TipgroupUser;
    },

    get tipSeasonMock() {
      return {
        id: 1,
        api_LeagueSeason: 2022,
        isClosed: false,
        matchdays: [],
      } as unknown as TipSeason;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipgroupsService,
        {
          provide: getRepositoryToken(Tipgroup),
          useValue: mockTipgroupRepository,
        },
        {
          provide: getRepositoryToken(TipgroupUser),
          useValue: createMock<Repository<TipgroupUser>>(),
        },
        {
          provide: SeasonService,
          useValue: createMock<SeasonService>(),
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: HashService,
          useValue: createMock<HashService>(),
        },
        {
          provide: ErrorManagerService,
          useValue: createMock<ErrorManagerService>(),
        },
      ],
    }).compile();

    service = module.get<TipgroupsService>(TipgroupsService);
    tipSeasonService = module.get(SeasonService);
    apiService = module.get(ApiService);
    userService = module.get(UserService);
    hashService = module.get(HashService);
    errorManagerService = module.get(ErrorManagerService);
    tipgroupUserRepository = module.get(getRepositoryToken(TipgroupUser));

    jest.spyOn(errorManagerService, 'createError').mockReturnValue(new HttpException('Error', 404));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Tipgroup', () => {
    it('should throw an error if matchday name already taken', async () => {
      mockTransactionalEntityManager.findOne.mockResolvedValueOnce({
        name: 'Tipgroup1',
      } as unknown as Tipgroup);
      const validateTipgroupNameSpy = jest.spyOn(service as any, 'validateTipgroupName');

      await expect(service.createTipgroup(mocks.createTipgroupDtoMocks[0], 1)).rejects.toThrow();

      expect(validateTipgroupNameSpy).toHaveBeenCalledWith(
        mocks.createTipgroupDtoMocks[0].name,
        mockTransactionalEntityManager
      );
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.TIPGROUP_NAME_TAKEN,
        HttpStatus.CONFLICT
      );
    });

    it('should throw an error if user not found', async () => {
      userService.findById.mockResolvedValueOnce(null);

      await expect(service.createTipgroup(mocks.createTipgroupDtoMocks[0], 1)).rejects.toThrow();
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.User.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    });

    it('should throw an error if leagueShortcut not found', async () => {
      userService.findById.mockResolvedValue(mocks.userMock);
      apiService.getAvailableLeagues.mockResolvedValue(LeaguesResponseMock);

      await expect(service.createTipgroup(mocks.createTipgroupDtoMocks[1], 1)).rejects.toThrow();
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.LEAGUE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    });

    it('should create a matchday successfully with correct data', async () => {
      userService.findById.mockResolvedValue({ ...mocks.userMock });
      apiService.getAvailableLeagues.mockResolvedValue(LeaguesResponseMock);
      apiService.getMatchData.mockResolvedValue(MatchResponseMock);
      hashService.hashPassword.mockResolvedValue('hashedPassword');
      tipSeasonService.createTipSeason.mockReturnValue(mocks.tipSeasonMock);
      const validateTipgroupNameSpy = jest.spyOn(service as any, 'validateTipgroupName');
      const validateAndGetAvailableLeaguesSpy = jest.spyOn(service as any, 'validateAndGetAvailableLeagues');

      const expectedTipgroup = {
        name: 'Tipgroup1',
        passwordHash: 'hashedPassword',
        users: [{ ...mocks.tipgroupUserMock }],
        seasons: [{ ...mocks.tipSeasonMock }],
      };

      mockTransactionalEntityManager.save.mockResolvedValue(expectedTipgroup);

      const result = await service.createTipgroup(mocks.createTipgroupDtoMocks[0], mocks.userMock.id);

      expect(mockTipgroupRepository.manager.transaction).toHaveBeenCalledTimes(1);
      expect(validateTipgroupNameSpy).toHaveBeenCalledWith(
        mocks.createTipgroupDtoMocks[0].name,
        mockTransactionalEntityManager
      );
      expect(validateAndGetAvailableLeaguesSpy).toHaveBeenCalledWith(mocks.createTipgroupDtoMocks[0].leagueShortcut);
      expect(userService.findById).toHaveBeenCalledWith(mocks.userMock.id, mockTransactionalEntityManager);
      expect(apiService.getAvailableGroups).toHaveBeenCalledWith('l1', 2022);
      expect(apiService.getMatchDataOfSeason).toHaveBeenCalledWith('l1', 2022);
      expect(hashService.hashPassword).toHaveBeenCalledWith(mocks.createTipgroupDtoMocks[0].password);

      expect(mockTransactionalEntityManager.create).toHaveBeenCalledWith(
        TipgroupUser,
        expect.objectContaining({ user: mocks.userMock, isAdmin: true })
      );

      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(
        Tipgroup,
        expect.objectContaining({
          name: expectedTipgroup.name,
          passwordHash: expectedTipgroup.passwordHash,
          seasons: expectedTipgroup.seasons,
          users: expect.arrayContaining([
            expect.objectContaining({
              isAdmin: true,
              user: mocks.userMock,
            }),
          ]),
        })
      );
      expect(result).toEqual(expectedTipgroup);
    });
  });

  describe('get Tipgroups for user', () => {
    it('should return an array of tip groups for a given user ID', async () => {
      const userId = 1;

      const tipgroup1 = new Tipgroup();
      tipgroup1.id = 101;
      tipgroup1.name = 'Group1';

      const tipgroup2 = new Tipgroup();
      tipgroup2.id = 102;
      tipgroup2.name = 'Group2';

      const tipgroupUserEntry1 = new TipgroupUser();
      tipgroupUserEntry1.userId = userId;
      tipgroupUserEntry1.tipgroup = tipgroup1;

      const tipgroupUserEntry2 = new TipgroupUser();
      tipgroupUserEntry2.userId = userId;
      tipgroupUserEntry2.tipgroup = tipgroup2;

      tipgroupUserRepository.find.mockResolvedValue([tipgroupUserEntry1, tipgroupUserEntry2]);

      const result = await service.getTipGroupsByUserId(userId);

      expect(result).toEqual([tipgroup1, tipgroup2]);
      expect(tipgroupUserRepository.find).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['tipgroup'],
      });
    });
  });
});
