import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  AvailableLeagueResponseDto,
  CreateTipgroupDto,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TipgroupService } from '../tipgroup.service';

export enum LoadingState {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
  INITIAL = 'INITIAL',
}

type TipgroupState = {
  loadingState: LoadingState;
  availableLeaguesState: {
    data: AvailableLeagueResponseDto[] | null;
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  createTipgroupState: {
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  availableTipgroups: TipgroupEntryResponseDto[] | null;
};

const initialState: TipgroupState = {
  loadingState: LoadingState.INITIAL,
  availableLeaguesState: {
    data: null,
    error: null,
    isLoading: false,
  },
  createTipgroupState: {
    error: null,
    isLoading: false,
  },
  availableTipgroups: null,
};

export const TipgroupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasTipgroups: computed(
      () => store.availableTipgroups() && store.availableTipgroups()!.length > 0
    ),
    hasAvailableLeaguesError: computed(
      () => !!store.availableLeaguesState.error()
    ),
    hasError: computed(() => store.loadingState() === LoadingState.ERROR),
    isLoading: computed(
      () =>
        store.loadingState() === LoadingState.LOADING ||
        store.loadingState() === LoadingState.INITIAL
    ),
  })),

  withMethods((store) => ({
    loadAvailableGroupsSuccess: (
      availableGroups: TipgroupEntryResponseDto[]
    ) => {
      patchState(store, {
        loadingState: LoadingState.LOADED,
        availableTipgroups: availableGroups,
      });
    },

    loadAvailableGroupsFailure: () => {
      patchState(store, {
        loadingState: LoadingState.ERROR,
      });
    },

    loadAvailableLeaguesSuccess: (
      availableLeagues: AvailableLeagueResponseDto[]
    ) => {
      patchState(store, {
        availableLeaguesState: {
          ...store.availableLeaguesState(),
          data: availableLeagues,
          isLoading: false,
        },
      });
    },

    loadAvailableLeaguesFailure: (error: HttpErrorResponse) => {
      patchState(store, {
        availableLeaguesState: {
          ...store.availableLeaguesState(),
          error,
          isLoading: false,
        },
      });
    },

    createTipgroupSuccess: (newTipgroup: TipgroupEntryResponseDto) => {
      const currentTipgroups = store.availableTipgroups() || [];
      patchState(store, {
        loadingState: LoadingState.LOADED,
        availableTipgroups: [...currentTipgroups, newTipgroup],
      });
    },

    createTipgroupFailure: () => {
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
            catchError(() => {
              store.loadAvailableGroupsFailure();
              return EMPTY;
            })
          );
        })
      )
    ),
    loadAvailableLeagues: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            availableLeaguesState: {
              ...store.availableLeaguesState(),
              isLoading: true,
              error: null,
            },
          })
        ),
        switchMap(() =>
          tipgroupService.getAvailableLeagues().pipe(
            tap((response: AvailableLeagueResponseDto[]) => {
              store.loadAvailableLeaguesSuccess(response);
            }),
            catchError((error: HttpErrorResponse) => {
              store.loadAvailableLeaguesFailure(error);
              return EMPTY;
            })
          )
        )
      )
    ),

    createTipgroup: rxMethod<{ createTipgroupDto: CreateTipgroupDto }>(
      pipe(
        tap(() => patchState(store, { loadingState: LoadingState.LOADING })),
        switchMap(({ createTipgroupDto }) =>
          tipgroupService.createTipgroup(createTipgroupDto).pipe(
            tap((tipgroupResponse: TipgroupEntryResponseDto) => {
              store.createTipgroupSuccess(tipgroupResponse);
            }),
            catchError(() => {
              store.createTipgroupFailure();
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
