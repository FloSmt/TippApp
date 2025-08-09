import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from 'rxjs';
import {GroupResponse, LeagueResponse, MatchResponse,} from '@tippapp/shared/data-access';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService
  ) {
  }

  private readonly apiUrl = this.config.get<string>('EXTERNAL_API_BASE_URL');

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
      console.log('Match Data:', response.data);

      return response.data.map((match: any) => new MatchResponse(match));
    } catch (error) {
      throw new HttpException(
        'Error on calling external API',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAvailableLeagues(): Promise<LeagueResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailableleagues/`;
      const response = await firstValueFrom(this.httpService.get(url));

      // Filters only Men/Women football with the targeted Season
      console.log('Available Leagues:', response.data);
      const filteredMatches = response.data.filter(
        (league: any) =>
          league.sport.sportId === 1 || league.sport.sportId === 79
      );
      return filteredMatches.map((league: any) => new LeagueResponse(league));
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error on calling external API',
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
      throw new HttpException(
        'Error on calling external API (' + error + ')',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
