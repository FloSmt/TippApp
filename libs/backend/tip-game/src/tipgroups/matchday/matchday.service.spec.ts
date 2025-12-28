import { Test, TestingModule } from '@nestjs/testing';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApiService, MatchResponseMock } from '@tippapp/backend/api';
import { ErrorCodes } from '@tippapp/shared/data-access';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MatchdayRepository } from '@tippapp/backend/shared';
import { MatchdayService } from './matchday.service';

describe('MatchdayService', () => {
  let service: MatchdayService;
  let apiServiceMock: DeepMocked<ApiService>;
  let matchdayRepositoryMock: DeepMocked<MatchdayRepository>;
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
});
