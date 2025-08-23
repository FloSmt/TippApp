import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@tippapp/frontend/utils';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthInterceptorService } from './auth-interceptor.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authInterceptorService = inject(AuthInterceptorService);
  const tokenRefresh$ = toObservable(authStore.accessToken);
  const refreshTokenSignal$ = toObservable(
    authInterceptorService.refreshTokenSignal
  );

  const newRequest = authStore.accessToken()
    ? addToken(req, authStore.accessToken()!)
    : req;

  return next(newRequest).pipe(
    catchError((err) => {
      if (err.status === 401 && !newRequest.url.includes('/auth/')) {
        if (!authInterceptorService.isRefreshing) {
          authInterceptorService.isRefreshing = true;
          authInterceptorService.refreshTokenSignal.set(null);

          authStore.refreshAccessToken();
          return tokenRefresh$.pipe(
            filter(() => !authStore.isLoading()),
            take(1),
            switchMap(() => {
              // Refresh Token success
              authInterceptorService.isRefreshing = false;
              const newToken = authStore.accessToken();
              if (newToken) {
                authInterceptorService.refreshTokenSignal.set(newToken);
                return next(addToken(newRequest, newToken));
              } else {
                authStore.logoutAndRedirect();
                return throwError(() => 'No AccessToken Provided!');
              }
            }),
            // Refresh token failed
            catchError((error) => {
              authInterceptorService.isRefreshing = false;
              authStore.logoutAndRedirect();
              return throwError(() => error);
            })
          );
        } else {
          // Currently Refreshing new AccessToken, Wait until Token is available
          return refreshTokenSignal$.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => {
              return next(addToken(newRequest, token!));
            })
          );
        }
      }

      return throwError(() => err);
    })
  );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`),
  });
}
