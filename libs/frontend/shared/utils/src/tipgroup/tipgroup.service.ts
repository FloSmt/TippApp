import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipgroupEntryResponseDto } from '@tippapp/shared/data-access';
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
    console.log('TipgroupService: getAvailableTipgroups');
    return this.httpClient.get<TipgroupEntryResponseDto[]>(
      this.BACKEND_URL + 'user/tipgroups'
    );
  }
}
