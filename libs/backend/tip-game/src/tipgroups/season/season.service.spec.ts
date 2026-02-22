import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCodes, GroupResponse, MatchApiResponse } from '@tippapp/shared/data-access';
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
    generateMatchday: jest.fn(),
  };

  const seasonRepositoryMock = {
    getAllMatchdays: jest.fn(),
    getCurrentMatchday: jest.fn(),
  };

  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
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
        {
          provide: 'CACHE_MANAGER',
          useValue: cacheMock,
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
    it('should return a TipSeason-Object with correct content', async () => {
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

      matchdayServiceMock.generateMatchday.mockResolvedValue('generated matchday');

      const tipSeason = await service.createTipSeason(season, leagueShortcut, matchDays, matches, mockEntityManager);

      expect(tipSeason.api_LeagueSeason).toBe(season);
      expect(tipSeason.isClosed).toBe(false);
      expect(tipSeason.matchdays.length).toBe(2);
      expect(tipSeason.matchdays[0]).toBe('generated matchday');
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
      seasonRepositoryMock.getCurrentMatchday.mockResolvedValue(mockMatchdays[0]);

      const result = await service.getAllMatchdays(1, 10);

      expect(result).toEqual({
        matchdays: mockMatchdays,
        currentMatchdayId: mockMatchdays[0].id,
      });
      expect(seasonRepositoryMock.getAllMatchdays).toHaveBeenCalledWith(1, 10);
      expect(errorManagerServiceMock.createError).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentMatchday', () => {
    let mockAllMatchdays: { id: number; matchdayId: number; name: string; orderId: number }[];
    let currentMatchday: { id: any; matchdayId?: number; name?: string; orderId?: number };
    let resolvedMatchday: { id: number; matchdayId: number; name: string; orderId: number };
    const tipgroupId = 1;
    const seasonId = 1;

    beforeEach(() => {
      mockAllMatchdays = [
        { id: 1, matchdayId: 1, name: 'Spieltag 1', orderId: 1 },
        { id: 2, matchdayId: 2, name: 'Spieltag 2', orderId: 2 },
        { id: 3, matchdayId: 3, name: 'Spieltag 3', orderId: 3 },
      ];

      currentMatchday = mockAllMatchdays[1];
      resolvedMatchday = mockAllMatchdays[1];
    });
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
      seasonRepositoryMock.getAllMatchdays.mockResolvedValue(mockAllMatchdays);
      seasonRepositoryMock.getCurrentMatchday.mockResolvedValue(currentMatchday);
      matchdayServiceMock.getMatchdayDetails.mockResolvedValue(resolvedMatchday);

      const result = await service.getCurrentMatchday(tipgroupId, seasonId);

      expect(result).toBe(resolvedMatchday);
      expect(seasonRepositoryMock.getCurrentMatchday).toHaveBeenCalledWith(seasonId);
      expect(matchdayServiceMock.getMatchdayDetails).toHaveBeenCalledWith(tipgroupId, seasonId, currentMatchday.id);
      expect(seasonRepositoryMock.getAllMatchdays).not.toHaveBeenCalled();
    });

    it('should return the the first Matchday of the Season if no currentMatchday returned', async () => {
      seasonRepositoryMock.getAllMatchdays.mockResolvedValue(mockAllMatchdays);
      seasonRepositoryMock.getCurrentMatchday.mockResolvedValue(null);
      matchdayServiceMock.getMatchdayDetails.mockResolvedValue(resolvedMatchday);

      const result = await service.getCurrentMatchday(tipgroupId, seasonId);

      expect(result).toBe(resolvedMatchday);
      expect(seasonRepositoryMock.getCurrentMatchday).toHaveBeenCalledWith(seasonId);
      expect(matchdayServiceMock.getMatchdayDetails).toHaveBeenCalledWith(tipgroupId, seasonId, mockAllMatchdays[0].id);
      expect(seasonRepositoryMock.getAllMatchdays).toHaveBeenCalledWith(tipgroupId, seasonId);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
