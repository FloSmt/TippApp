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
  availableLeaguesState: {
    data: AvailableLeagueResponseDto[] | null;
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  createTipgroupState: {
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  availableTipgroupsState: {
    data: TipgroupEntryResponseDto[] | null;
    loadingState: LoadingState;
  };
};

const initialState: TipgroupState = {
  availableLeaguesState: {
    data: null,
    error: null,
    isLoading: false,
  },
  createTipgroupState: {
    error: null,
    isLoading: false,
  },
  availableTipgroupsState: {
    data: null,
    loadingState: LoadingState.INITIAL,
  },
};

export const TipgroupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasTipgroups: computed(
      () =>
        store.availableTipgroupsState.data() &&
        store.availableTipgroupsState.data()!.length > 0
    ),
    hasAvailableLeaguesError: computed(
      () => !!store.availableLeaguesState.error()
    ),
    hasErrorOnLoadingTipgroups: computed(
      () => store.availableTipgroupsState.loadingState() === LoadingState.ERROR
    ),
    isLoadingTipgroups: computed(
      () =>
        store.availableTipgroupsState.loadingState() === LoadingState.LOADING ||
        store.availableTipgroupsState.loadingState() === LoadingState.INITIAL
    ),
  })),

  withMethods((store) => ({
    loadAvailableGroupsSuccess: (
      availableGroups: TipgroupEntryResponseDto[]
    ) => {
      patchState(store, {
        availableTipgroupsState: {
          ...store.availableTipgroupsState(),
          loadingState: LoadingState.LOADED,
          data: availableGroups,
        },
      });
    },

    loadAvailableGroupsFailure: () => {
      patchState(store, {
        availableTipgroupsState: {
          ...store.availableTipgroupsState(),
          loadingState: LoadingState.ERROR,
        },
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
      const currentTipgroups = store.availableTipgroupsState.data() || [];
      patchState(store, {
        availableTipgroupsState: {
          ...store.availableTipgroupsState(),
          data: [...currentTipgroups, newTipgroup],
        },
        createTipgroupState: {
          ...store.createTipgroupState(),
          isLoading: false,
        },
      });
    },

    createTipgroupFailure: (error: HttpErrorResponse) => {
      patchState(store, {
        createTipgroupState: {
          ...store.createTipgroupState(),
          isLoading: false,
          error: error,
        },
      });
    },
  })),

  withMethods((store, tipgroupService = inject(TipgroupService)) => ({
    loadAvailableTipgroups: rxMethod<{ reload: boolean }>(
      pipe(
        tap(({ reload }) =>
          patchState(store, {
            availableTipgroupsState: {
              ...store.availableTipgroupsState(),
              loadingState: reload
                ? LoadingState.LOADING
                : LoadingState.INITIAL,
            },
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
        tap(() =>
          patchState(store, {
            createTipgroupState: {
              ...store.createTipgroupState(),
              isLoading: true,
              error: null,
            },
          })
        ),
        switchMap(({ createTipgroupDto }) =>
          tipgroupService.createTipgroup(createTipgroupDto).pipe(
            tap((tipgroupResponse: TipgroupEntryResponseDto) => {
              store.createTipgroupSuccess(tipgroupResponse);
            }),
            catchError((error: HttpErrorResponse) => {
              store.createTipgroupFailure(error);
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
