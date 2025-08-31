import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {TipgroupEntryResponseDto} from "@tippapp/shared/data-access";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TipgroupService {
  readonly BACKEND_URL = 'http://localhost:3000/api/'; //TODO: add to environment-variables

  readonly httpClient = inject(HttpClient);

  getAvailableTipgroups(): Observable<TipgroupEntryResponseDto[]> {
    console.log('TipgroupService: getAvailableTipgroups');
    return this.httpClient.get<TipgroupEntryResponseDto[]>(this.BACKEND_URL + 'user/tipgroups');
  }
}
