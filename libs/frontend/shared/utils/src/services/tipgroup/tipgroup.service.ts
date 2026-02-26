import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateTipgroupDto,
  LeagueOverviewResponseDto,
  MatchdayDetailsResponseDto,
  MatchdayListResponseDto,
  TipgroupDetailsResponseDto,
  TipgroupOverviewResponseDto,
} from '@tippapp/shared/data-access';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../environments/environment.token';

@Injectable({
  providedIn: 'root',
})
export class TipgroupService {
  readonly httpClient = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  readonly BACKEND_URL = this.env.apiUrl;

  getAvailableTipgroups(): Observable<TipgroupOverviewResponseDto[]> {
    return this.httpClient.get<TipgroupOverviewResponseDto[]>(this.BACKEND_URL + 'tipgroups');
  }

  getAvailableLeagues(): Observable<LeagueOverviewResponseDto[]> {
    return this.httpClient.get<LeagueOverviewResponseDto[]>(this.BACKEND_URL + 'tipgroups/getAvailableLeagues');
  }

  getTipgroupDetails(tipgroupId: number): Observable<TipgroupDetailsResponseDto> {
    return this.httpClient.get<TipgroupOverviewResponseDto>(this.BACKEND_URL + `tipgroups/${tipgroupId}`);
  }

  getMatchdayDetails(tipgroupId: number, seasonId: number, matchdayId: number): Observable<MatchdayDetailsResponseDto> {
    return this.httpClient.get<MatchdayDetailsResponseDto>(
      this.BACKEND_URL + `tipgroups/${tipgroupId}/seasons/${seasonId}/matchdays/${matchdayId}`
    );
  }

  getCurrentMatchdayDetails(tipgroupId: number, seasonId: number): Observable<MatchdayDetailsResponseDto> {
    return this.httpClient.get<MatchdayDetailsResponseDto>(
      this.BACKEND_URL + `tipgroups/${tipgroupId}/seasons/${seasonId}/getCurrentMatchday`
    );
  }

  getMatchdayOverview(tipgroupId: number, seasonId: number): Observable<MatchdayListResponseDto> {
    return this.httpClient.get<MatchdayListResponseDto>(
      this.BACKEND_URL + `tipgroups/${tipgroupId}/seasons/${seasonId}/getAllMatchdays`
    );
  }

  createTipgroup(createTipgroupDto: CreateTipgroupDto): Observable<TipgroupOverviewResponseDto> {
    return this.httpClient.post<TipgroupOverviewResponseDto>(this.BACKEND_URL + 'tipgroups', createTipgroupDto);
  }
}
