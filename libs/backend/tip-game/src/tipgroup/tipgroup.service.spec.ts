import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import {
  CreateTipgroupDto,
  Match,
  Matchday,
  Tipgroup,
  TipSeason,
  User,
} from '@tippapp/shared/data-access';
import {
  ApiService,
  GroupResponseMock,
  LeaguesResponseMock,
  MatchResponseMock,
} from '@tippapp/backend/api';
import { UserService } from '@tippapp/backend/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { TipSeasonService } from '../tipseason';

describe('TipgroupService', () => {
  let service: TipgroupService;
  let tipgroupRepository: DeepMocked<Repository<Tipgroup>>;
  let tipSeasonService: DeepMocked<TipSeasonService>;
  let apiService: DeepMocked<ApiService>;
  let userService: DeepMocked<UserService>;

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

    get tipSeasonMock() {
      return {
        id: 1,
        api_LeagueSeason: 2022,
        isClosed: false,
        matchdays: [],
      } as any as TipSeason;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipgroupService,
        {
          provide: getRepositoryToken(Tipgroup),
          useValue: createMock<Repository<Tipgroup>>(),
        },
        {
          provide: TipSeasonService,
          useValue: createMock<TipSeasonService>(),
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    service = module.get<TipgroupService>(TipgroupService);
    tipgroupRepository = module.get(getRepositoryToken(Tipgroup));
    tipSeasonService = module.get(TipSeasonService);
    apiService = module.get(ApiService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Tipgroup', () => {
    it('should throw an error if user not found', async () => {
      userService.findById.mockResolvedValueOnce(null);

      await expect(
        service.createTipgroup(mocks.createTipgroupDtoMocks[0], 1)
      ).rejects.toThrow(new NotFoundException('User was not found'));
    });

    it('should throw an error if leagueShortcut not found', async () => {
      userService.findById.mockResolvedValue(mocks.userMock);
      apiService.getAvailableLeagues.mockResolvedValue(LeaguesResponseMock);

      await expect(
        service.createTipgroup(mocks.createTipgroupDtoMocks[1], 1)
      ).rejects.toThrow(new NotFoundException('LeagueShortcut was not found'));
    });

    it('should create a tipgroup successfully with correct data', async () => {
      userService.findById.mockResolvedValue(mocks.userMock);
      apiService.getAvailableGroups.mockResolvedValue(GroupResponseMock);
      apiService.getAvailableLeagues.mockResolvedValue(LeaguesResponseMock);
      apiService.getMatchData.mockResolvedValue(MatchResponseMock);

      // Mock the repository methods
      const mockTipgroupInstance = new Tipgroup();
      mockTipgroupInstance.name = mocks.createTipgroupDtoMocks[0].name;
      mockTipgroupInstance.passwordHash =
        mocks.createTipgroupDtoMocks[0].password;
      mockTipgroupInstance.users = [];
      mockTipgroupInstance.seasons = [];

      tipgroupRepository.create.mockReturnValue(mockTipgroupInstance);
      tipgroupRepository.save.mockResolvedValue(mockTipgroupInstance);

      // Mock TipSeasonService
      const expectedMatchdaysForTipSeason: Matchday[] = GroupResponseMock.map(
        (group) => ({
          name: group.groupName,
          api_groupId: group.groupId,
          matches: MatchResponseMock.filter(
            (match) => match.group.groupId === group.groupId
          ).map((match) => ({ api_matchId: match.matchId } as Match)),
          id: expect.any(Number),
          season: null!,
          seasonId: 1,
          orderId: group.groupOrderId,
        })
      );

      const createdTipSeasonMock: TipSeason = {
        ...mocks.tipSeasonMock,
        matchdays: expectedMatchdaysForTipSeason,
      };

      tipSeasonService.createNewTipSeason.mockReturnValue(createdTipSeasonMock);
      tipSeasonService.saveTipSeason.mockResolvedValue(createdTipSeasonMock);

      const result = await service.createTipgroup(
        mocks.createTipgroupDtoMocks[0],
        1
      );

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(apiService.getAvailableGroups).toHaveBeenCalledWith(
        mocks.createTipgroupDtoMocks[0].leagueShortcut,
        mocks.createTipgroupDtoMocks[0].currentSeason
      );
      expect(apiService.getMatchData).toHaveBeenCalledWith(
        mocks.createTipgroupDtoMocks[0].leagueShortcut,
        mocks.createTipgroupDtoMocks[0].currentSeason
      );

      expect(apiService.getAvailableLeagues).toHaveBeenCalledTimes(1);

      expect(tipgroupRepository.create).toHaveBeenCalledWith({
        name: mocks.createTipgroupDtoMocks[0].name,
        passwordHash: mocks.createTipgroupDtoMocks[0].password,
      });

      expect(tipgroupRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        expect.objectContaining({
          name: mocks.createTipgroupDtoMocks[0].name,
          passwordHash: mocks.createTipgroupDtoMocks[0].password,
          users: expect.arrayContaining([
            expect.objectContaining({
              isAdmin: true,
              user: mocks.userMock,
            }),
          ]),
          seasons: expect.arrayContaining([
            expect.objectContaining({
              api_LeagueSeason: mocks.createTipgroupDtoMocks[0].currentSeason,
              isClosed: false,
              matchdays: expect.arrayContaining([
                expect.objectContaining({
                  name: GroupResponseMock[0].groupName,
                  api_groupId: GroupResponseMock[0].groupId,
                  matches: expect.arrayContaining([
                    expect.objectContaining({
                      api_matchId: MatchResponseMock[0].matchId,
                    }),
                    expect.objectContaining({
                      api_matchId: MatchResponseMock[1].matchId,
                    }),
                  ]),
                }),
                expect.objectContaining({
                  name: GroupResponseMock[1].groupName,
                  api_groupId: GroupResponseMock[1].groupId,
                  matches: [],
                }),
              ]),
            }),
          ]),
        })
      );

      // Verify TipSeasonService calls
      expect(tipSeasonService.createNewTipSeason).toHaveBeenCalledWith(
        expect.objectContaining({
          api_LeagueSeason: mocks.createTipgroupDtoMocks[0].currentSeason,
          isClosed: false,
          matchdays: expect.arrayContaining([
            expect.objectContaining({
              name: GroupResponseMock[0].groupName,
              api_groupId: GroupResponseMock[0].groupId,
              matches: expect.arrayContaining([
                expect.objectContaining({
                  api_matchId: MatchResponseMock[0].matchId,
                }),
                expect.objectContaining({
                  api_matchId: MatchResponseMock[1].matchId,
                }),
              ]),
            }),
          ]),
        })
      );
      expect(tipSeasonService.saveTipSeason).toHaveBeenCalledWith(
        createdTipSeasonMock
      );
    });
  });
});
