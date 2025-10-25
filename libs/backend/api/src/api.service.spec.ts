import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ErrorCodes,
  GroupResponse,
  LeagueResponse,
  MatchResponse,
} from '@tippapp/shared/data-access';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchResponseMock } from './mocks';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let errorManagerService: DeepMocked<ErrorManagerService>;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        ConfigService,
        { provide: HttpService, useValue: mockHttpService },
        {
          provide: ErrorManagerService,
          useValue: createMock<ErrorManagerService>(),
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
    errorManagerService = module.get(ErrorManagerService);

    jest
      .spyOn(errorManagerService, 'createError')
      .mockReturnValue(new HttpException('Error', 404));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMatchDay', () => {
    it('should return mapped MatchResponse[]', async () => {
      const response: AxiosResponse = {
        config: undefined,
        data: MatchResponseMock,
        status: 200,
        statusText: 'OK',
        headers: {},
      };
      mockHttpService.get.mockReturnValue(of(response));

      const result = await service.getMatchData('bl1', 2024, 1);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MatchResponse);

      const resultWithoutMatchday = await service.getMatchData('bl1', 2024);
      expect(resultWithoutMatchday).toHaveLength(2);
      expect(resultWithoutMatchday[0]).toBeInstanceOf(MatchResponse);
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await expect(service.getMatchData('bl1', 2024, 1)).rejects.toThrow(
        HttpException
      );
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    });
  });

  describe('getAvailableLeaguesFromApi', () => {
    it('should return filtered LeagueResponse[]', async () => {
      const mockData = [
        {
          sport: { sportId: 1 },
          leagueName: 'League 1',
          leagueShortcut: 'bl1',
        },
        { sport: { sportId: 79 }, name: 'League 2', leagueShortcut: 'pl' },
        { sport: { sportId: 5 }, name: 'Other', leagueShortcut: 'xyz' },
      ];
      const response: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };
      mockHttpService.get.mockReturnValue(of(response));

      const result = await (service as any).getAvailableLeaguesFromApi();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LeagueResponse);
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      await expect(
        (service as any).getAvailableLeaguesFromApi()
      ).rejects.toThrow();
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    });
  });

  describe('getAvailableGroups', () => {
    it('should return GroupResponse[]', async () => {
      const mockData = [{ groupId: 1 }, { groupId: 2 }];
      const response: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };
      mockHttpService.get.mockReturnValue(of(response));

      const result = await service.getAvailableGroups('bl1', 2024);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(GroupResponse);
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      await expect(service.getAvailableGroups('bl1', 2024)).rejects.toThrow(
        HttpException
      );
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    });
  });

  describe('getAvailableLeagues', () => {
    const mockLeagues = [
      { leagueId: 1, leagueName: 'Bundesliga' },
      { leagueId: 2, leagueName: 'Premier League' },
    ] as LeagueResponse[];

    it('should return cached leagues if cache is valid', async () => {
      const now = Date.now();
      service['fetchedLeagues'] = mockLeagues;
      service['dateOfLastFetch'] = now;
      service['cacheDuration'] = 10000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = await service.getAvailableLeagues();
      expect(result).toEqual(mockLeagues);
    });

    it('should fetch new leagues if cache is invalid', async () => {
      const now = Date.now();
      service['fetchedLeagues'] = mockLeagues;
      service['dateOfLastFetch'] = now - 20000;
      service['cacheDuration'] = 10000;

      jest.spyOn(Date, 'now').mockReturnValue(now);
      const newLeagues: LeagueResponse[] = [
        { leagueId: 3, leagueName: 'La Liga' },
      ] as LeagueResponse[];

      jest
        .spyOn(service as any, 'getAvailableLeaguesFromApi')
        .mockResolvedValue(newLeagues);

      const result = await service.getAvailableLeagues();
      expect(result).toEqual(newLeagues);
      expect(service['fetchedLeagues']).toEqual(newLeagues);
      expect(service['dateOfLastFetch']).toBe(now);
    });

    it('should fetch new leagues if cache is empty', async () => {
      service['fetchedLeagues'] = undefined;
      service['dateOfLastFetch'] = undefined;
      const now = Date.now();

      jest.spyOn(Date, 'now').mockReturnValue(now);
      const newLeagues: LeagueResponse[] = [
        { leagueId: 4, leagueName: 'Serie A' },
      ] as LeagueResponse[];
      jest
        .spyOn(service as any, 'getAvailableLeaguesFromApi')
        .mockResolvedValue(newLeagues);

      const result = await service.getAvailableLeagues();
      expect(result).toEqual(newLeagues);
      expect(service['fetchedLeagues']).toEqual(newLeagues);
      expect(service['dateOfLastFetch']).toBe(now);
    });
  });
});
