import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTipgroupDto, LeagueOverviewResponseDto, TipgroupEntryResponseDto } from '@tippapp/shared/data-access';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../environments/environment.token';

@Injectable({
  providedIn: 'root',
})
export class TipgroupService {
  readonly httpClient = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  readonly BACKEND_URL = this.env.apiUrl;

  getAvailableTipgroups(): Observable<TipgroupEntryResponseDto[]> {
    return this.httpClient.get<TipgroupEntryResponseDto[]>(this.BACKEND_URL + 'tipgroups');
  }

  getAvailableLeagues(): Observable<LeagueOverviewResponseDto[]> {
    return this.httpClient.get<LeagueOverviewResponseDto[]>(this.BACKEND_URL + 'tipgroups/getAvailableLeagues');
  }

  createTipgroup(createTipgroupDto: CreateTipgroupDto): Observable<TipgroupEntryResponseDto> {
    return this.httpClient.post<TipgroupEntryResponseDto>(this.BACKEND_URL + 'tipgroups', createTipgroupDto);
  }
}
