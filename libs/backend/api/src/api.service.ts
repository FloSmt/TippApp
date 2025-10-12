import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ErrorCodes,
  GroupResponse,
  LeagueResponse,
  MatchResponse,
} from '@tippapp/shared/data-access';
import { ConfigService } from '@nestjs/config';
import { ErrorManagerService } from '@tippapp/backend/error-handling';

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly errorManager: ErrorManagerService
  ) {}

  private readonly apiUrl = this.config.get<string>('EXTERNAL_API_BASE_URL');

  private fetchedLeagues: LeagueResponse[] | null = null;
  private dateOfLastFetch: number | null = null;
  private readonly cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private readonly allowedLeagues = [
    'bl1',
    'bl2',
    'pl',
    'sa',
    'pd',
    'fl1',
    'ded',
  ];

  async getMatchData(
    leagueShortcut: string,
    season: number,
    groupId?: number
  ): Promise<MatchResponse[]> {
    try {
      let url: string;
      if (groupId) {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}/${groupId}`;
      } else {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}`;
      }

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((match: any) => new MatchResponse(match));
    } catch (error) {
      console.warn('Error on calling external API (getMatchData)', error);
      throw this.errorManager.createError(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAvailableLeagues(): Promise<LeagueResponse[]> {
    const now = Date.now();
    if (
      this.fetchedLeagues &&
      this.dateOfLastFetch &&
      now - this.dateOfLastFetch < this.cacheDuration
    ) {
      console.log('Returning cached leagues');
      return this.fetchedLeagues;
    }

    console.log('Fetching new leagues from API');
    const leagues = await this.getAvailableLeaguesFromApi();
    this.fetchedLeagues = leagues;
    this.dateOfLastFetch = now;

    return leagues;
  }

  private async getAvailableLeaguesFromApi(): Promise<LeagueResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailableleagues/`;
      const response = await firstValueFrom(this.httpService.get(url));

      // Filters only Men/Women football with the targeted Season
      const filteredMatches = response.data.filter(
        (league: any) =>
          (league.sport.sportId === 1 || league.sport.sportId === 79) &&
          this.allowedLeagues.includes(league.leagueShortcut.toLowerCase())
      );
      return filteredMatches.map((league: any) => new LeagueResponse(league));
    } catch (error) {
      console.warn(
        'Error on calling external API (getAvailableLeagues)',
        error
      );
      throw this.errorManager.createError(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAvailableGroups(
    leagueShortcut: string,
    season: number
  ): Promise<GroupResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailablegroups/${leagueShortcut}/${season}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((group: any) => new GroupResponse(group));
    } catch (error) {
      console.warn('Error on calling external API (getAvailableGroups)', error);
      throw this.errorManager.createError(
        ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
