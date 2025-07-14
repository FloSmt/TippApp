import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  GroupResponse,
  LeagueResponse,
  MatchResponse,
} from '@tippapp/shared/data-access';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchResponseMock } from './mocks';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        ConfigService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
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
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await expect(service.getMatchData('bl1', 2024, 1)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('getAvailableLeagues', () => {
    it('should return filtered LeagueResponse[]', async () => {
      const mockData = [
        { sport: { sportId: 1 }, name: 'League 1' },
        { sport: { sportId: 79 }, name: 'League 2' },
        { sport: { sportId: 5 }, name: 'Other' },
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

      const result = await service.getAvailableLeagues();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LeagueResponse);
    });

    it('should throw HttpException on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      await expect(service.getAvailableLeagues()).rejects.toThrow(
        HttpException
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
    });
  });
});
