import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService {
  isRefreshing = false;
  refreshTokenSignal: WritableSignal<string | null> = signal(null);
}
