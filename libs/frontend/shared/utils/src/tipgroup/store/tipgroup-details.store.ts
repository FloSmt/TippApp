import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  MatchdayDetailsResponseDto,
  MatchdayOverviewResponseDto,
  TipgroupDetailsResponseDto,
} from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { TipgroupService } from '../tipgroup.service';

export interface MatchdayCache {
  data: MatchdayDetailsResponseDto;
  ttl: number;
}

type TipgroupDetailsState = {
  _selectedTipgroupId: number | null;
  _selectedSeasonId: number | null;
  _selectedMatchdayId: number | null;
  _loadedMatchdays: Map<number, MatchdayCache>;
  _matchdayOverview: MatchdayOverviewResponseDto[] | null;
  _tipgroupDetails: TipgroupDetailsResponseDto | null;
  _hasError: boolean;
  _isLoading: {
    tipgroupDetails: boolean;
    matchday: boolean;
  };
};

const initialState: TipgroupDetailsState = {
  _selectedTipgroupId: null,
  _selectedSeasonId: null,
  _selectedMatchdayId: null,
  _loadedMatchdays: new Map<number, MatchdayCache>(),
  _matchdayOverview: null,
  _tipgroupDetails: null,
  _hasError: false,
  _isLoading: {
    tipgroupDetails: false,
    matchday: false,
  },
};

export const TipgroupDetailsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    getCurrentMatchday: () => {
      if (store._selectedMatchdayId() !== null) {
        const loadedCache = store._loadedMatchdays().get(store._selectedMatchdayId()!);
        return loadedCache ? loadedCache.data : null;
      }

      return null;
    },

    getTipgroupDetails: () => {
      return store._tipgroupDetails;
    },

    getMatchdayOverview: () => {
      return store._matchdayOverview;
    },

    isLoading: () => {
      return { tipgroupDetails: store._isLoading.tipgroupDetails, matchdayData: store._isLoading.matchday };
    },
  })),

  withMethods((store) => ({
    loadTipgroupDetailsSuccess: (tipgroupDetails: TipgroupDetailsResponseDto) => {
      patchState(store, {
        _tipgroupDetails: tipgroupDetails,
        _selectedSeasonId: tipgroupDetails.currentSeasonId,
        _isLoading: { ...store._isLoading(), tipgroupDetails: false },
      });
    },

    loadTipgroupDetailsFailure: (error: any) => {
      patchState(store, {
        _isLoading: { ...store._isLoading(), tipgroupDetails: false },
        _tipgroupDetails: null,
        _selectedTipgroupId: null,
        _selectedSeasonId: null,
        _selectedMatchdayId: null,
        _hasError: true,
      });
    },

    loadInitialDataSuccess: (
      currentMatchday: MatchdayDetailsResponseDto,
      allMatchdays: MatchdayOverviewResponseDto[]
    ) => {
      patchState(store, {
        _loadedMatchdays: store
          ._loadedMatchdays()
          .set(currentMatchday.matchdayId, { data: currentMatchday, ttl: Date.now() }),
        _matchdayOverview: allMatchdays,
        _selectedMatchdayId: currentMatchday.matchdayId,
        _isLoading: { ...store._isLoading(), matchday: false },
      });
    },

    loadInitialDataFailure: (error: any) => {
      patchState(store, {
        _isLoading: { ...store._isLoading(), matchday: false },
        _hasError: true,
      });
    },
  })),

  withMethods((store, tipgroupService = inject(TipgroupService)) => ({
    loadInitialData: rxMethod<{ tipgroupId: number }>(
      pipe(
        tap(({ tipgroupId }) => {
          patchState(store, {
            _isLoading: { ...store._isLoading(), tipgroupDetails: true, matchday: true },
            _selectedTipgroupId: tipgroupId,
          });
        }),
        switchMap(({ tipgroupId }) => {
          return tipgroupService.getTipgroupDetails(tipgroupId).pipe(
            tap((tipgroupDetails) => {
              store.loadTipgroupDetailsSuccess(tipgroupDetails);
            }),
            catchError((err) => {
              store.loadTipgroupDetailsFailure(err);
              return EMPTY;
            })
          );
        }),
        switchMap((tipgroupDetails) =>
          forkJoin({
            current: tipgroupService.getMatchdayDetails(tipgroupDetails.id, tipgroupDetails.currentSeasonId || 0, 1),
            overview: tipgroupService.getMatchdayOverview(tipgroupDetails.id, tipgroupDetails.currentSeasonId || 0),
          }).pipe(
            tap(({ current, overview }) => store.loadInitialDataSuccess(current, overview)),
            catchError((err) => {
              store.loadInitialDataFailure(err);
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
