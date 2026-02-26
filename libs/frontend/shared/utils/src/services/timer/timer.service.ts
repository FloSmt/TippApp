import { Injectable } from '@angular/core';
import { interval, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  public halfMinuteTick$: Observable<number> = interval(30000).pipe(
    map(() => {
      return Date.now();
    }),
    shareReplay(1)
  );
}
