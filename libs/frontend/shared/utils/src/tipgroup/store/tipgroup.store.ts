import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TipgroupEntryResponseDto } from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TipgroupService } from '../tipgroup.service';
import { ErrorManagementService } from '../../error-management/error-management.service';

export enum LoadingState {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
  INITIAL = 'INITIAL',
}

type TipgroupState = {
  loadingState: LoadingState;
  availableTipgroups: TipgroupEntryResponseDto[] | null;
};

const initialState: TipgroupState = {
  loadingState: LoadingState.INITIAL,
  availableTipgroups: null,
};

export const TipgroupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasTipgroups: computed(
      () => store.availableTipgroups() && store.availableTipgroups()!.length > 0
    ),
    hasError: computed(() => store.loadingState() === LoadingState.ERROR),
    isLoading: computed(
      () =>
        store.loadingState() === LoadingState.LOADING ||
        store.loadingState() === LoadingState.INITIAL
    ),
  })),

  withMethods((store, errorService = inject(ErrorManagementService)) => ({
    loadAvailableGroupsSuccess: (
      availableGroups: TipgroupEntryResponseDto[]
    ) => {
      patchState(store, {
        loadingState: LoadingState.LOADED,
        availableTipgroups: availableGroups,
      });
    },

    loadAvailableGroupsFailure: (error: HttpErrorResponse) => {
      errorService.handleApiError(error);
      patchState(store, {
        loadingState: LoadingState.ERROR,
      });
    },
  })),

  withMethods((store, tipgroupService = inject(TipgroupService)) => ({
    loadAvailableTipgroups: rxMethod<{ reload: boolean }>(
      pipe(
        tap(({ reload }) =>
          patchState(store, {
            loadingState: reload ? LoadingState.LOADING : LoadingState.INITIAL,
          })
        ),
        switchMap(() => {
          return tipgroupService.getAvailableTipgroups().pipe(
            tap((response: TipgroupEntryResponseDto[]) =>
              store.loadAvailableGroupsSuccess(response)
            ),
            catchError((error) => {
              store.loadAvailableGroupsFailure(error);
              return EMPTY;
            })
          );
        })
      )
    ),
  }))
);
