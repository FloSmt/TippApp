import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCodes, GroupResponse, MatchApiResponse, TipSeason } from '@tippapp/shared/data-access';
import { SeasonRepository } from '@tippapp/backend/shared';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { SeasonService } from './season.service';
import { MatchdayService } from '../matchday/matchday.service';

describe('SeasonService', () => {
  let service: SeasonService;
  let errorManagerServiceMock: DeepMocked<ErrorManagerService>;

  const matchdayServiceMock = {
    getMatchdayDetails: jest.fn(),
  };

  const seasonRepositoryMock = {
    getAllMatchdays: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonService,
        {
          provide: SeasonRepository,
          useValue: seasonRepositoryMock,
        },
        {
          provide: MatchdayService,
          useValue: matchdayServiceMock,
        },
        {
          provide: ErrorManagerService,
          useValue: createMock(ErrorManagerService),
        },
      ],
    }).compile();

    service = module.get<SeasonService>(SeasonService);
    errorManagerServiceMock = module.get(ErrorManagerService);

    jest.spyOn(errorManagerServiceMock, 'createError').mockImplementation(() => {
      throw new HttpException('Error', HttpStatus.NOT_FOUND);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTipSeason', () => {
    it('should return a TipSeason-Object with correct content', () => {
      const mockEntityManager = {
        create: jest.fn((entity, data) => {
          return { ...data };
        }),
      } as any;

      const season = 2023;
      const leagueShortcut = 'bl1';
      const matchDays: GroupResponse[] = [
        { groupId: 11, groupName: 'Matchday 1', groupOrderId: 1 },
        { groupId: 22, groupName: 'Matchday 2', groupOrderId: 2 },
      ];
      const matches = [
        { matchId: 101, group: { groupId: 11 } },
        { matchId: 102, group: { groupId: 11 } },
        { matchId: 201, group: { groupId: 22 } },
      ] as unknown as MatchApiResponse[];

      const tipSeason = service.createTipSeason(season, leagueShortcut, matchDays, matches, mockEntityManager);

      expect(mockEntityManager.create).toHaveBeenCalledWith(TipSeason, expect.anything());
      expect(tipSeason.api_LeagueSeason).toBe(season);
      expect(tipSeason.isClosed).toBe(false);
      expect(tipSeason.matchdays.length).toBe(2);
      expect(tipSeason.matchdays[0].name).toBe('Matchday 1');
      expect(tipSeason.matchdays[0].api_groupOrderId).toBe(1);
      expect(tipSeason.matchdays[0].orderId).toBe(1);
      expect(tipSeason.matchdays[0].api_leagueShortcut).toBe(leagueShortcut);
      expect(tipSeason.matchdays[0].matches.length).toBe(2);
      expect(tipSeason.matchdays[0].matches[0].api_matchId).toBe(101);
      expect(tipSeason.matchdays[0].matches[1].api_matchId).toBe(102);
      expect(tipSeason.matchdays[1].name).toBe('Matchday 2');
      expect(tipSeason.matchdays[1].api_groupOrderId).toBe(2);
      expect(tipSeason.matchdays[1].orderId).toBe(2);
      expect(tipSeason.matchdays[1].api_leagueShortcut).toBe(leagueShortcut);
      expect(tipSeason.matchdays[1].matches.length).toBe(1);
      expect(tipSeason.matchdays[1].matches[0].api_matchId).toBe(201);
    });
  });

  describe('getAllMatchdays', () => {
    it('should throw an error if seasonId is null, undefined or not an integer', async () => {
      const invalidIds = [null, undefined, 'abc', 1.5];

      for (const id of invalidIds) {
        await expect(service.getAllMatchdays(1, id as any)).rejects.toThrow(HttpException);
        expect(errorManagerServiceMock.createError).toHaveBeenCalledWith(
          ErrorCodes.Tipgroup.SEASON_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
    });

    it('should return matchdays from repository if seasonId is valid', async () => {
      const mockMatchdays = [
        { id: 1, name: 'Spieltag 1' },
        { id: 2, name: 'Spieltag 2' },
      ];
      seasonRepositoryMock.getAllMatchdays.mockResolvedValue(mockMatchdays);

      const result = await service.getAllMatchdays(1, 10);

      expect(result).toEqual(mockMatchdays);
      expect(seasonRepositoryMock.getAllMatchdays).toHaveBeenCalledWith(1, 10);
      expect(errorManagerServiceMock.createError).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentMatchday', () => {
    it('should throw an error if seasonId is null, undefined or not an integer', async () => {
      const invalidIds = [null, undefined, 'abc', 1.5];

      for (const id of invalidIds) {
        await expect(service.getCurrentMatchday(1, id as any)).rejects.toThrow(HttpException);
        expect(errorManagerServiceMock.createError).toHaveBeenCalledWith(
          ErrorCodes.Tipgroup.SEASON_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
    });
    it('should return the current Matchday of the Season', async () => {
      const mockMatchdays = [
        { matchdayId: 1, name: 'Spieltag 1' },
        { matchdayId: 2, name: 'Spieltag 2' },
      ];

      const resolvedMatchday = { matchdayId: 1, name: 'Spieltag 1', orderId: 1 };

      seasonRepositoryMock.getAllMatchdays.mockResolvedValue(mockMatchdays);
      matchdayServiceMock.getMatchdayDetails.mockResolvedValue(resolvedMatchday);

      const result = await service.getCurrentMatchday(1, 1);

      expect(result).toBe(resolvedMatchday);
      expect(seasonRepositoryMock.getAllMatchdays).toHaveBeenCalledWith(1, 1);
      expect(matchdayServiceMock.getMatchdayDetails).toHaveBeenCalledWith(1, 1, mockMatchdays[0].matchdayId);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
