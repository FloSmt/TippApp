import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ErrorCodes,
  GroupResponse,
  LeagueOverviewResponseDto,
  LeagueResponse,
  MatchApiResponse,
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

  private fetchedLeagues: LeagueOverviewResponseDto[] | null = null;
  private dateOfLastFetch: number | null = null;
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private readonly allowedLeagues = ['bl1', 'bl2', 'pl', 'sa', 'pd', 'fl1', 'ded'];

  // Cache for match data with a key based on leagueShortcut, season, and groupId
  private matchDataCache: { [key: string]: { data: MatchApiResponse[]; lastUpdate: Date } } = {};

  /**
   * Gets match data for a specific league, season, and group. If the data is cached and up-to-date, it returns the cached data.
   * Otherwise, it fetches new data from the API and updates the cache.
   * @param leagueShortcut The shortcut of the league (e.g., 'bl1' for Bundesliga 1).
   * @param season The season year (e.g., 2023).
   * @param groupId The group ID within the league and season.
   * @returns A promise that resolves to an array of MatchResponse objects.
   */
  async getMatchData(leagueShortcut: string, season: number, groupId: number): Promise<MatchApiResponse[]> {
    const cacheKey = `${leagueShortcut}_${season}_${groupId}`;

    // Check if data is in cache
    if (this.matchDataCache[cacheKey]) {
      const cachedData = this.matchDataCache[cacheKey];
      const timeout = 1000 * 60 * 3; // 3 minutes
      const now = new Date();

      // If cached data is recent enough, return it
      if (now.getTime() - cachedData.lastUpdate.getTime() < timeout) {
        console.log('Returning recently cached match data');
        return cachedData.data;
      }

      const lastUpdatedDate = new Date(await this.getLastUpdatedMatchdayDate(leagueShortcut, season, groupId));

      // If the last updated date matches, return cached data
      if (cachedData.lastUpdate === lastUpdatedDate) {
        console.log('Returning cached match data');
        return cachedData.data;
      }
    }

    // Fetch new data from API
    console.log('Fetching new match data from API');
    const matchData = await this.getMatchDataFromApi(leagueShortcut, season, groupId);
    const lastUpdatedDate = await this.getLastUpdatedMatchdayDate(leagueShortcut, season, groupId);

    // Update cache
    this.matchDataCache[cacheKey] = {
      data: matchData,
      lastUpdate: new Date(lastUpdatedDate),
    };

    return matchData;
  }

  async getMatchDataOfSeason(leagueShortcut: string, season: number): Promise<MatchApiResponse[]> {
    return this.getMatchDataFromApi(leagueShortcut, season);
  }

  protected async getMatchDataFromApi(
    leagueShortcut: string,
    season: number,
    groupId?: number
  ): Promise<MatchApiResponse[]> {
    try {
      let url: string;
      if (groupId) {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}/${groupId}`;
      } else {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}`;
      }

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((match: any) => new MatchApiResponse(match));
    } catch (error) {
      console.warn('Error on calling external API (getMatchData)', error);
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE, HttpStatus.BAD_REQUEST);
    }
  }

  async getAvailableLeagues(): Promise<LeagueOverviewResponseDto[]> {
    const now = Date.now();
    if (this.fetchedLeagues && this.dateOfLastFetch && now - this.dateOfLastFetch < this.cacheDuration) {
      console.log('Returning cached leagues');
      return this.fetchedLeagues;
    }

    console.log('Fetching new leagues from API');
    const leagues = await this.getAvailableLeaguesFromApi();
    this.fetchedLeagues = leagues;
    this.dateOfLastFetch = now;

    return leagues;
  }

  protected async getLastUpdatedMatchdayDate(leagueShortcut: string, season: number, groupId: number): Promise<string> {
    try {
      const url = `${this.apiUrl}/getlastchangedate/${leagueShortcut}/${season}/${groupId}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      console.warn('Error on calling external API (getlastchangedate)', error);
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE, HttpStatus.BAD_REQUEST);
    }
  }

  protected async getAvailableLeaguesFromApi(): Promise<LeagueResponse[]> {
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
      console.warn('Error on calling external API (getAvailableLeagues)', error);
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE, HttpStatus.BAD_REQUEST);
    }
  }

  async getAvailableGroups(leagueShortcut: string, season: number): Promise<GroupResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailablegroups/${leagueShortcut}/${season}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((group: any) => new GroupResponse(group));
    } catch (error) {
      console.warn('Error on calling external API (getAvailableGroups)', error);
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.API_DATA_UNAVAILABLE, HttpStatus.BAD_REQUEST);
    }
  }
}
