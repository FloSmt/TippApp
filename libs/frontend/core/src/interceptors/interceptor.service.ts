import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { AuthStore } from '@tippapp/frontend/utils';
import {
  catchError,
  filter,
  Observable,
  pairwise,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class InterceptorService {
  isRefreshing = false;
  refreshTokenSignal: WritableSignal<string | null> = signal(null);
  authStore = inject(AuthStore);

  tokenRefresh$ = toObservable(this.authStore.isLoading);
  refreshTokenSignal$ = toObservable(this.refreshTokenSignal);

  addAuthTokenToHeader(
    request: HttpRequest<unknown>,
    token: string
  ): HttpRequest<unknown> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  handleTokenRefresh(
    next: HttpHandlerFn,
    req: HttpRequest<unknown>
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSignal.set(null);

      this.authStore.refreshAccessToken();
      return this.tokenRefresh$.pipe(
        pairwise(),
        filter(([previous, current]) => previous === true && current === false),
        take(1),
        switchMap(() => {
          // Refresh Token success
          console.log('Refresh Token Success');
          this.isRefreshing = false;
          const newToken = this.authStore.accessToken();
          if (newToken) {
            this.refreshTokenSignal.set(newToken);
            return next(this.addAuthTokenToHeader(req, newToken));
          } else {
            this.authStore.logoutAndRedirect();
            return throwError(() => 'No AccessToken Provided!');
          }
        }),
        // Refresh token failed
        catchError((error) => {
          console.log('Refresh Token Failed: ', error);
          this.isRefreshing = false;
          this.authStore.logoutAndRedirect();
          return throwError(() => error);
        })
      );
    } else {
      // Currently Refreshing new AccessToken, Wait until Token is available
      return this.refreshTokenSignal$.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next(this.addAuthTokenToHeader(req, token!));
        })
      );
    }
  }
}
