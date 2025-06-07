import {Test, TestingModule} from '@nestjs/testing';
import {TipgroupService} from './tipgroup.service';
import {createMock, DeepMocked} from "@golevelup/ts-jest";
import {Repository} from "typeorm";
import {Match, Matchday, Tipgroup, TipSeason, User} from "@tippapp/backend/database";
import {TipSeasonService} from "@tippapp/backend/tip-game";
import {ApiService} from "@tippapp/backend/api";
import {UserService} from "@tippapp/backend/user";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CreateTipgroupDto} from "@tippapp/shared/data-access";
import {NotFoundException} from "@nestjs/common";
import {groupResponseMock} from "../../../api/src/mocks/group-response.mock";
import {matchResponseMock} from "../../../api/src/mocks/match-response.mock";

describe('TipgroupService', () => {
  let service: TipgroupService;
  let tipgroupRepository: DeepMocked<Repository<Tipgroup>>;
  let tipSeasonService: DeepMocked<TipSeasonService>;
  let apiService: DeepMocked<ApiService>;
  let userService: DeepMocked<UserService>;

  const createTipgroupDtoMock = {
    name: 'Tipgroup1',
    leagueShortcut: 'bl1',
    currentSeason: 2022,
    passwordHash: '212'
  } as CreateTipgroupDto

  const userMock = {
    id: 1,
    username: 'user',
    email: 'test@test.de',
    password: 'password',
  } as User

  const tipSeasonMock: TipSeason = {
    id: 1,
    api_LeagueSeason: 2022,
    isClosed: false,
    matchdays: [],
  } as any as TipSeason;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipgroupService,
        {
          provide: getRepositoryToken(Tipgroup),
          useValue: createMock<Repository<Tipgroup>>()
        },
        {
          provide: TipSeasonService,
          useValue: createMock<TipSeasonService>()
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>()
        },
        {
          provide: UserService,
          useValue: createMock<UserService>()
        }
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

      await expect(service.createTipgroup(createTipgroupDtoMock, 1)).rejects.toThrow(new NotFoundException('User was not found'));
    })

    it('should create a tipgroup successfully with correct data', async () => {
      userService.findById.mockResolvedValue(userMock);
      apiService.getAvailableGroups.mockResolvedValue(groupResponseMock);
      apiService.getMatchData.mockResolvedValue(matchResponseMock);

      // Mock the repository methods
      const mockTipgroupInstance = new Tipgroup();
      mockTipgroupInstance.name = createTipgroupDtoMock.name;
      mockTipgroupInstance.passwordHash = createTipgroupDtoMock.passwordHash;
      mockTipgroupInstance.users = [];
      mockTipgroupInstance.seasons = [];

      tipgroupRepository.create.mockReturnValue(mockTipgroupInstance);
      tipgroupRepository.save.mockResolvedValue(mockTipgroupInstance);

      // Mock TipSeasonService
      const expectedMatchdaysForTipSeason: Matchday[] = groupResponseMock.map(group => ({
        name: group.groupName,
        api_groupId: group.groupId,
        matches: matchResponseMock
          .filter(match => match.group.groupId === group.groupId)
          .map(match => ({api_matchId: match.matchId} as Match)),
        id: expect.any(Number),
        season: null!,
        seasonId: 1,
        orderId: group.groupOrderId,
      }));

      const createdTipSeasonMock: TipSeason = {
        ...tipSeasonMock,
        matchdays: expectedMatchdaysForTipSeason,
      };

      tipSeasonService.createNewTipSeason.mockReturnValue(createdTipSeasonMock);
      tipSeasonService.saveTipSeason.mockResolvedValue(createdTipSeasonMock);


      const result = await service.createTipgroup(createTipgroupDtoMock, 1);

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(apiService.getAvailableGroups).toHaveBeenCalledWith(
        createTipgroupDtoMock.leagueShortcut,
        createTipgroupDtoMock.currentSeason
      );
      expect(apiService.getMatchData).toHaveBeenCalledWith(
        createTipgroupDtoMock.leagueShortcut,
        createTipgroupDtoMock.currentSeason
      );

      expect(tipgroupRepository.create).toHaveBeenCalledWith({
        name: createTipgroupDtoMock.name,
        passwordHash: createTipgroupDtoMock.passwordHash,
      });

      expect(tipgroupRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining({
        name: createTipgroupDtoMock.name,
        passwordHash: createTipgroupDtoMock.passwordHash,
        users: expect.arrayContaining([
          expect.objectContaining({
            isAdmin: true,
            user: userMock,
          }),
        ]),
        seasons: expect.arrayContaining([
          expect.objectContaining({
            api_LeagueSeason: createTipgroupDtoMock.currentSeason,
            isClosed: false,
            matchdays: expect.arrayContaining([
              expect.objectContaining({
                name: groupResponseMock[0].groupName,
                api_groupId: groupResponseMock[0].groupId,
                matches: expect.arrayContaining([
                  expect.objectContaining({api_matchId: matchResponseMock[0].matchId}),
                  expect.objectContaining({api_matchId: matchResponseMock[1].matchId}),
                ]),
              }),
              expect.objectContaining({
                name: groupResponseMock[1].groupName,
                api_groupId: groupResponseMock[1].groupId,
                matches: []
              }),
            ]),
          }),
        ]),
      }));

      // Verify TipSeasonService calls
      expect(tipSeasonService.createNewTipSeason).toHaveBeenCalledWith(expect.objectContaining({
        api_LeagueSeason: createTipgroupDtoMock.currentSeason,
        isClosed: false,
        matchdays: expect.arrayContaining([
          expect.objectContaining({
            name: groupResponseMock[0].groupName,
            api_groupId: groupResponseMock[0].groupId,
            matches: expect.arrayContaining([
              expect.objectContaining({api_matchId: matchResponseMock[0].matchId}),
              expect.objectContaining({api_matchId: matchResponseMock[1].matchId}),
            ]),
          }),
        ]),
      }));
      expect(tipSeasonService.saveTipSeason).toHaveBeenCalledWith(createdTipSeasonMock);
    });
  });
});
