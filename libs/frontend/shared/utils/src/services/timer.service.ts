import { Injectable } from '@angular/core';
import { interval, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  public minuteTick$: Observable<number> = interval(5000).pipe(
    map(() => {
      console.log('JETZT');
      return Date.now();
    }),
    shareReplay(1)
  );
}
