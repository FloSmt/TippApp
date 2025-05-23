import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {MatchResponse} from "./responses/match.response";
import {LeagueResponse} from "./responses/league.response";
import {GroupResponse} from "./responses/group.response";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ApiService {

  constructor(private readonly httpService: HttpService,
              private readonly config: ConfigService) {}

  private readonly apiUrl = this.config.get<string>('EXTERNAL_API_BASE_URL');

  async getMatchDay(leagueShortcut: string, season: number, groupId?: number): Promise<MatchResponse[]> {
    try {
      let url = "";
      if (groupId) {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}/${groupId}`;
      }else {
        url = `${this.apiUrl}/getmatchdata/${leagueShortcut}/${season}`;
      }

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((match: any) => new MatchResponse(match));

    }catch (error) {
      throw new HttpException('Error on calling external API',
        HttpStatus.BAD_REQUEST);
    }
  }

  async getAvailableLeagues(): Promise<LeagueResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailableleagues/`;
      const response = await firstValueFrom(this.httpService.get(url));


      // Filters only Men/Women football with the targeted Season
      const filteredMatches = response.data.filter((league) => (league.sport.sportId === 1 || league.sport.sportId === 79));
      return filteredMatches.map((league: any) => new LeagueResponse(league));

    }catch (error) {
      console.log(error);
      throw new HttpException('Error on calling external API',
        HttpStatus.BAD_REQUEST);
    }
  }

  async getAvailableGroups(leagueShortcut: string, season: number): Promise<GroupResponse[]> {
    try {
      const url = `${this.apiUrl}/getavailablegroups/${leagueShortcut}/${season}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.map((group: any) => new GroupResponse(group));

    }catch (error) {
      throw new HttpException('Error on calling external API (' + error + ')',
        HttpStatus.BAD_REQUEST);
    }
  }
}
