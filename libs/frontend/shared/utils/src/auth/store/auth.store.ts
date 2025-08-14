import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { AxiosError } from 'axios';
import { AuthService } from '../index';

type AuthState = {
  isLoading: boolean;
  accessToken: string | null;
  error: string | null;
};

const initialState: AuthState = {
  isLoading: false,
  accessToken: null,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.accessToken()),
    hasError: computed(() => !!store.error()),
  })),

  withMethods((store, authService = inject(AuthService)) => ({
    registrationSuccess: (accessToken: string) => {
      patchState(store, { isLoading: false, accessToken });
    },

    registrationFailure: (error: string) => {
      patchState(store, { isLoading: false, error });
    },

    loginSuccess: (accessToken: string) => {
      patchState(store, { isLoading: false, accessToken });
    },

    loginFailure: (error: string) => {
      patchState(store, { isLoading: false, error });
    },

    refreshSuccess: (accessToken: string) => {
      patchState(store, { isLoading: false, accessToken });
    },

    refreshFailure: (error: string) => {
      patchState(store, { isLoading: false, error });
    },

    logoutAndRedirect: () => {
      patchState(store, { isLoading: false, accessToken: null });
      authService.logoutAndRedirect();
    },
  })),

  withMethods((store, authService = inject(AuthService)) => ({
    registerNewUser: rxMethod<{ registerDto: RegisterDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ registerDto }) =>
          authService.registerNewUser(registerDto).pipe(
            tap((response) => store.registrationSuccess(response.accessToken)),
            catchError((err: AxiosError) => {
              store.registrationFailure(err.message);
              return EMPTY;
            })
          )
        )
      )
    ),

    loginUser: rxMethod<{ loginDto: LoginDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ loginDto }) =>
          authService.loginUser(loginDto).pipe(
            tap((response) => store.loginSuccess(response.accessToken)),
            catchError((err) => {
              console.log('Login error:', err);
              store.loginFailure(err.message);
              return EMPTY;
            })
          )
        )
      )
    ),

    refreshAccessToken: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { isLoading: true, error: null, accessToken: null })
        ),
        switchMap(() =>
          authService.refreshAccessToken().pipe(
            tap((response) => store.refreshSuccess(response.accessToken)),
            catchError((err) => {
              store.refreshFailure(err.message);
              store.logoutAndRedirect();
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
