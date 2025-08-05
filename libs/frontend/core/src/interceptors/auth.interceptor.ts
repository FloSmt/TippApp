import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject, signal, WritableSignal} from "@angular/core";
import {AuthStore} from "@tippapp/frontend/utils";
import {catchError, filter, switchMap, take, throwError} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";

let isRefreshing = false;
const refreshTokenSignal: WritableSignal<string | null> = signal(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const tokenRefresh$ = toObservable(authStore.accessToken);

  const newRequest = authStore.accessToken()
    ? addToken(req, authStore.accessToken()!)
    : req;

  return next(newRequest).pipe(
    catchError((err) => {
      if (err.status === 401 && authStore.isAuthenticated()) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSignal.set(null);

          authStore.refreshAccessToken();
          return tokenRefresh$.pipe(
            filter((accessToken) => accessToken !== null && !authStore.isLoading()),
            take(1),
            switchMap(() => {
              isRefreshing = false;
              const newToken = authStore.accessToken();
              if (newToken) {
                refreshTokenSignal.set(newToken);
                return next(addToken(newRequest, newToken));
              } else {
                authStore.logoutAndRedirect();
                return throwError(() => 'No AccessToken Provided!');
              }
            }),
            catchError((error) => {
              isRefreshing = false;
              authStore.logoutAndRedirect();
              return throwError(() => error);
            })
          );
        } else {
          return toObservable(refreshTokenSignal).pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => {
              return next(addToken(newRequest, token!));
            })
          )
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
