import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiValidationErrorMessage, AuthResponseDto, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, TokenStorageService } from '../index';
import { ErrorManagementService } from '../../error-management/error-management.service';
import { NotificationService, NotificationType } from '../../notifications/notification.service';

type AuthState = {
  isLoading: boolean;
  accessToken: string | null;
  error: ApiValidationErrorMessage[] | null;
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

  withMethods(
    (
      store,
      authService = inject(AuthService),
      errorService = inject(ErrorManagementService),
      notificationService = inject(NotificationService),
      tokenStorageService = inject(TokenStorageService)
    ) => ({
      registrationSuccess: async (response: AuthResponseDto) => {
        notificationService.showTypeMessage(
          {
            message: 'Dein Account wurde erfolgreich angelegt.',
            header: 'Account erstellt',
          },
          NotificationType.SUCCESS
        );
        patchState(store, { isLoading: false, accessToken: response.accessToken });
        await tokenStorageService.setRefreshToken(response.refreshToken);
      },

      registrationFailure: (error: HttpErrorResponse) => {
        patchState(store, {
          isLoading: false,
          error: errorService.getValidationError(error),
        });
      },

      loginSuccess: async (response: AuthResponseDto) => {
        patchState(store, { isLoading: false, accessToken: response.accessToken });
        await tokenStorageService.setRefreshToken(response.refreshToken);
      },

      loginFailure: (error: HttpErrorResponse) => {
        patchState(store, {
          isLoading: false,
          error: errorService.getValidationError(error),
        });
      },

      refreshSuccess: async (response: AuthResponseDto) => {
        patchState(store, { isLoading: false, accessToken: response.accessToken });
        await tokenStorageService.setRefreshToken(response.refreshToken);
      },

      refreshFailure: (error: HttpErrorResponse) => {
        patchState(store, {
          isLoading: false,
          error: errorService.getValidationError(error),
        });
      },

      logoutAndRedirect: async () => {
        patchState(store, { isLoading: false, accessToken: null });
        await tokenStorageService.clearTokens();
        authService.logoutAndRedirect();
      },
    })
  ),

  withMethods((store, authService = inject(AuthService)) => ({
    registerNewUser: rxMethod<{ registerDto: RegisterDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ registerDto }) =>
          authService.registerNewUser(registerDto).pipe(
            tap((response) => store.registrationSuccess(response)),
            catchError((err) => {
              store.registrationFailure(err);
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
            tap((response) => store.loginSuccess(response)),
            catchError((err) => {
              store.loginFailure(err);
              return EMPTY;
            })
          )
        )
      )
    ),

    refreshAccessToken: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, accessToken: null })),
        switchMap(() =>
          authService.refreshAccessToken().pipe(
            tap((response) => store.refreshSuccess(response)),
            catchError((err) => {
              store.refreshFailure(err);
              store.logoutAndRedirect();
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
