import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CreateTipgroupDto, LeagueOverviewResponseDto, TipgroupOverviewResponseDto } from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TipgroupService } from '../tipgroup.service';
import { NotificationService, NotificationType } from '../../notifications/notification.service';

export enum LoadingState {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
  INITIAL = 'INITIAL',
}

type TipgroupManagementState = {
  availableLeaguesState: {
    data: LeagueOverviewResponseDto[] | null;
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  createTipgroupState: {
    error: HttpErrorResponse | null;
    isLoading: boolean;
  };
  availableTipgroupsState: {
    data: TipgroupOverviewResponseDto[] | null;
    loadingState: LoadingState;
  };
};

const initialState: TipgroupManagementState = {
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

export const TipgroupManagementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasTipgroups: computed(
      () => store.availableTipgroupsState.data() && store.availableTipgroupsState.data()!.length > 0
    ),
    hasAvailableLeaguesError: computed(() => !!store.availableLeaguesState.error()),
    hasErrorOnLoadingTipgroups: computed(() => store.availableTipgroupsState.loadingState() === LoadingState.ERROR),
    isLoadingTipgroups: computed(
      () =>
        store.availableTipgroupsState.loadingState() === LoadingState.LOADING ||
        store.availableTipgroupsState.loadingState() === LoadingState.INITIAL
    ),
  })),

  withMethods((store, notificationService = inject(NotificationService)) => ({
    loadAvailableTipgroupsSuccess: (availableGroups: TipgroupOverviewResponseDto[]) => {
      patchState(store, {
        availableTipgroupsState: {
          ...store.availableTipgroupsState(),
          loadingState: LoadingState.LOADED,
          data: availableGroups,
        },
      });
    },

    loadAvailableTipgroupsFailure: () => {
      patchState(store, {
        availableTipgroupsState: {
          ...store.availableTipgroupsState(),
          loadingState: LoadingState.ERROR,
        },
      });
    },

    loadAvailableLeaguesSuccess: (availableLeagues: LeagueOverviewResponseDto[]) => {
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

    createTipgroupSuccess: (newTipgroup: TipgroupOverviewResponseDto) => {
      const currentTipgroups = store.availableTipgroupsState.data() || [];
      notificationService.showTypeMessage(
        {
          header: 'Tippgruppe erstellt',
          message: newTipgroup.name + ' wurde erfolgreich erstellt.',
        },
        NotificationType.SUCCESS
      );
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
              loadingState: reload ? LoadingState.LOADING : LoadingState.INITIAL,
            },
          })
        ),
        switchMap(() => {
          return tipgroupService.getAvailableTipgroups().pipe(
            tap((response: TipgroupOverviewResponseDto[]) => store.loadAvailableTipgroupsSuccess(response)),
            catchError(() => {
              store.loadAvailableTipgroupsFailure();
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
            tap((response: LeagueOverviewResponseDto[]) => {
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
            tap((tipgroupResponse: TipgroupOverviewResponseDto) => {
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
