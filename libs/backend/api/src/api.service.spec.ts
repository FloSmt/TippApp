import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ErrorCodes, GroupResponse, LeagueResponse, MatchApiResponse } from '@tippapp/shared/data-access';
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

    jest.spyOn(errorManagerService, 'createError').mockReturnValue(new HttpException('Error', 404));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMatchdayFromApi', () => {
    it('should return mapped MatchResponse[]', async () => {
      const response: AxiosResponse = {
        config: undefined,
        data: MatchResponseMock,
        status: 200,
        statusText: 'OK',
        headers: {},
      };
      mockHttpService.get.mockReturnValue(of(response));

      const result = await (service as any).getMatchDataFromApi('bl1', 2024, 1);
      expect(result).toHaveLength(MatchResponseMock.length);
      expect(result[0]).toBeInstanceOf(MatchApiResponse);
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      await expect((service as any).getMatchDataFromApi('bl1', 2024, 1)).rejects.toThrow(HttpException);
      expect(errorManagerService.createError).toHaveBeenCalledWith(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    });
  });

  describe('getMatchData', () => {
    it('should return cached data if the last fetch was within the cache duration', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(new Date('2024-06-01T12:00:00Z').getTime());
      const getLastUpdatedMachdayDateMock = jest.spyOn(service as any, 'getLastUpdatedMatchdayDate');
      const getMatchDataFromApiSpy = jest.spyOn(service as any, 'getMatchDataFromApi');

      service['matchDataCache'] = {
        bl1_2024_1: {
          data: MatchResponseMock,
          lastUpdate: new Date('2024-06-01T11:59:00Z'),
        },
      };

      const result = await service.getMatchData('bl1', 2024, 1);
      expect(result).toHaveLength(MatchResponseMock.length);
      expect(result[0]).toStrictEqual(MatchResponseMock[0]);
      expect(mockHttpService.get).not.toHaveBeenCalled();
      expect(getLastUpdatedMachdayDateMock).not.toHaveBeenCalled();
      expect(getMatchDataFromApiSpy).not.toHaveBeenCalled();
    });

    it('should return cached data if the api last updated date matches the cached last update date', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(new Date('2024-06-01T12:00:00Z').getTime());

      service['matchDataCache'] = {
        bl1_2024_1: {
          data: MatchResponseMock,
          lastUpdate: new Date('2024-05-31T10:00:00Z'),
        },
      };

      const getLastUpdatedMachdayDateMock = jest
        .spyOn(service as any, 'getLastUpdatedMatchdayDate')
        .mockResolvedValue('2024-05-31T10:00:00Z');
      const getMatchDataFromApiSpy = jest.spyOn(service as any, 'getMatchDataFromApi');

      const result = await service.getMatchData('bl1', 2024, 1);
      expect(result).toHaveLength(MatchResponseMock.length);
      expect(result[0]).toStrictEqual(MatchResponseMock[0]);
      expect(getLastUpdatedMachdayDateMock).toHaveBeenCalledWith('bl1', 2024, 1);
      expect(getMatchDataFromApiSpy).not.toHaveBeenCalled();
    });

    it('should fetch new data if the api last updated date is different', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(new Date('2024-06-01T12:00:00Z').getTime());

      service['matchDataCache'] = {
        bl1_2024_1: {
          data: MatchResponseMock,
          lastUpdate: new Date('2024-05-30T10:00:00Z'),
        },
      };

      const getLastUpdatedMachdayDateMock = jest
        .spyOn(service as any, 'getLastUpdatedMatchdayDate')
        .mockResolvedValue('2024-05-31T10:00:00Z');
      const getMatchDataFromApiMock = jest
        .spyOn(service as any, 'getMatchDataFromApi')
        .mockResolvedValue([{ data: 'some new data' }] as any);

      const result = await service.getMatchData('bl1', 2024, 1);
      expect(result[0]).toStrictEqual({ data: 'some new data' } as any);
      expect(getLastUpdatedMachdayDateMock).toHaveBeenCalledWith('bl1', 2024, 1);
      expect(getMatchDataFromApiMock).toHaveBeenCalledWith('bl1', 2024, 1);
      expect(service['matchDataCache']['bl1_2024_1'].lastUpdate).toEqual(new Date('2024-05-31T10:00:00Z'));
      expect(service['matchDataCache']['bl1_2024_1'].data).toEqual([{ data: 'some new data' }]);
    });

    it('should fetch new data if no cache is available', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(new Date('2024-06-01T12:00:00Z').getTime());

      const getLastUpdatedMachdayDateMock = jest
        .spyOn(service as any, 'getLastUpdatedMatchdayDate')
        .mockResolvedValue('2024-05-31T10:00:00Z');
      const getMatchDataFromApiMock = jest
        .spyOn(service as any, 'getMatchDataFromApi')
        .mockResolvedValue([{ data: 'some new data' }] as any);

      expect(service['matchDataCache']['bl1_2024_1']).not.toBeDefined();

      const result = await service.getMatchData('bl1', 2024, 1);

      expect(result[0]).toStrictEqual({ data: 'some new data' } as any);
      expect(getLastUpdatedMachdayDateMock).toHaveBeenCalledWith('bl1', 2024, 1);
      expect(getMatchDataFromApiMock).toHaveBeenCalledWith('bl1', 2024, 1);
      expect(service['matchDataCache']['bl1_2024_1'].lastUpdate).toEqual(new Date('2024-05-31T10:00:00Z'));
      expect(service['matchDataCache']['bl1_2024_1'].data).toEqual([{ data: 'some new data' }]);
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
      mockHttpService.get.mockReturnValue(throwError(() => new Error('API Error')));

      await expect((service as any).getAvailableLeaguesFromApi()).rejects.toThrow();
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
      mockHttpService.get.mockReturnValue(throwError(() => new Error('API Error')));

      await expect(service.getAvailableGroups('bl1', 2024)).rejects.toThrow(HttpException);
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
      const newLeagues: LeagueResponse[] = [{ leagueId: 3, leagueName: 'La Liga' }] as LeagueResponse[];

      jest.spyOn(service as any, 'getAvailableLeaguesFromApi').mockResolvedValue(newLeagues);

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
      const newLeagues: LeagueResponse[] = [{ leagueId: 4, leagueName: 'Serie A' }] as LeagueResponse[];
      jest.spyOn(service as any, 'getAvailableLeaguesFromApi').mockResolvedValue(newLeagues);

      const result = await service.getAvailableLeagues();
      expect(result).toEqual(newLeagues);
      expect(service['fetchedLeagues']).toEqual(newLeagues);
      expect(service['dateOfLastFetch']).toBe(now);
    });
  });
});
