import { Test, TestingModule } from '@nestjs/testing';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApiService, MatchResponseMock } from '@tippapp/backend/api';
import { ErrorCodes, GroupResponse, Match, MatchApiResponse } from '@tippapp/shared/data-access';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MatchdayRepository, MatchRepository } from '@tippapp/backend/shared';
import { EntityManager } from 'typeorm';
import { MatchdayService } from './matchday.service';

describe('MatchdayService', () => {
  let service: MatchdayService;
  let apiServiceMock: DeepMocked<ApiService>;
  let matchdayRepositoryMock: DeepMocked<MatchdayRepository>;
  let matchRepositoryMock: DeepMocked<MatchRepository>;
  let errorManagerServiceMock: DeepMocked<ErrorManagerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchdayService,
        {
          provide: MatchdayRepository,
          useValue: createMock<MatchdayRepository>(),
        },
        {
          provide: MatchRepository,
          useValue: createMock<MatchRepository>(),
        },
        {
          provide: ErrorManagerService,
          useValue: createMock<ErrorManagerService>(),
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>(),
        },
      ],
    }).compile();

    service = module.get<MatchdayService>(MatchdayService);
    matchdayRepositoryMock = module.get(MatchdayRepository);
    matchRepositoryMock = module.get(MatchRepository);
    errorManagerServiceMock = module.get(ErrorManagerService);
    apiServiceMock = module.get(ApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMatchdayData', () => {
    it('should throw an error if no matchday data was found', async () => {
      matchdayRepositoryMock.getMatchdayFromDb.mockResolvedValue(undefined);
      errorManagerServiceMock.createError.mockReturnValue(new HttpException('Error', 500));

      await expect(service.getMatchdayDetails(1, 2023, 1)).rejects.toThrow();
      expect(matchdayRepositoryMock.getMatchdayFromDb).toHaveBeenCalledWith(1, 2023, 1);
      expect(errorManagerServiceMock.createError).toHaveBeenCalledWith(
        ErrorCodes.Tipgroup.MATCHDAY_DETAILS_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    });

    it('should return MatchdayResponseDto and map relevant matches', async () => {
      const matchdayFromDb = {
        matchday: {
          orderId: 5,
          name: 'Matchday 1',
          matches: [{ api_matchId: '2' }, { api_matchId: '1' }],
          api_leagueShortcut: 'LIGA',
          api_leagueSeason: 2025,
          api_groupOrderId: 2,
        },
      };

      matchdayRepositoryMock.getMatchdayFromDb.mockResolvedValue(matchdayFromDb);
      apiServiceMock.getMatchData.mockResolvedValue(MatchResponseMock);

      const result = await service.getMatchdayDetails(123, 2025, 7);

      expect(matchdayRepositoryMock.getMatchdayFromDb).toHaveBeenCalledWith(123, 2025, 7);
      expect(apiServiceMock.getMatchData).toHaveBeenCalledWith('LIGA', 2025, 2);

      expect(result.orderId).toBe(5);
      expect(result.name).toBe('Matchday 1');
      expect(result.matchCount).toBe(2);
      expect(result.matchdayId).toBe(7);

      expect(result.league.leagueId).toBe(MatchResponseMock[0].leagueId);
      expect(result.league.leagueName).toBe(MatchResponseMock[0].leagueName);
      expect(result.league.leagueSeason).toBe(matchdayFromDb.matchday.api_leagueSeason);
      expect(result.league.leagueShortcut).toBe(matchdayFromDb.matchday.api_leagueShortcut);
      expect(result.matchList.length).toBe(2);
      expect(result.matchList[0]).toStrictEqual(expect.objectContaining({ matchId: 1 }));
      expect(result.matchList[1]).toStrictEqual(expect.objectContaining({ matchId: 2 }));
    });
  });

  describe('createMatchdayEntity', () => {
    it('should create a Matchday entity with correct data', async () => {
      const mockEntityManager = {
        upsert: jest.fn(),
      } as unknown as EntityManager;

      const matchDay: GroupResponse = { groupId: 11, groupName: 'Matchday 1', groupOrderId: 1 };
      const matches = [
        { matchId: 101, group: { groupId: 11 } },
        { matchId: 102, group: { groupId: 11 } },
        { matchId: 201, group: { groupId: 22 } },
      ] as unknown as MatchApiResponse[];

      matchRepositoryMock.findAllByApiMatchId.mockResolvedValue([
        { api_matchId: 101 } as Match,
        { api_matchId: 102 } as Match,
      ]);

      const matchdayEntity = await service.createMatchdayEntity(matchDay, matches, 'bl1', mockEntityManager);

      expect(mockEntityManager.upsert).toHaveBeenCalledWith(
        expect.any(Function),
        expect.arrayContaining([
          expect.objectContaining({ api_matchId: 101 }),
          expect.objectContaining({ api_matchId: 102 }),
        ]),
        { conflictPaths: ['api_matchId'] }
      );
      expect(matchdayEntity.name).toBe('Matchday 1');
      expect(matchdayEntity.api_groupOrderId).toBe(1);
      expect(matchdayEntity.orderId).toBe(1);
      expect(matchdayEntity.api_leagueShortcut).toBe('bl1');
      expect(matchdayEntity.matches.length).toBe(2);
      expect(matchdayEntity.matches[0].api_matchId).toBe(101);
      expect(matchdayEntity.matches[1].api_matchId).toBe(102);
    });
  });
});
