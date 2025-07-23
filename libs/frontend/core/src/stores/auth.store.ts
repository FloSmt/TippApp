import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthService } from '../services';

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
    isAuthenticated: computed(() => !!store.accessToken),
    hasError: computed(() => !!store.error),
  })),

  withMethods((store) => ({
    registrationSuccess: (accessToken: string) => {
      patchState(store, { isLoading: false, accessToken });
    },

    registrationFailure: (error: string) => {
      patchState(store, { isLoading: false, error });
    },
  })),

  withMethods((store, authService = inject(AuthService)) => ({
    registerNewUser: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.registerNewUser().pipe(
            tap({
              next: (response) =>
                store.registrationSuccess(response.accessToken),
              error: (err) => store.registrationFailure(err.message),
            })
          )
        )
      )
    ),
  }))
);
