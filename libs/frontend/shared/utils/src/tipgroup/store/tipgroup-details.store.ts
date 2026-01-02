import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  MatchdayDetailsResponseDto,
  MatchdayOverviewResponseDto,
  TipgroupDetailsResponseDto,
} from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, debounceTime, EMPTY, filter, forkJoin, of, pipe, switchMap, tap } from 'rxjs';
import { TipgroupService } from '../tipgroup.service';

export interface MatchdayCache {
  data: MatchdayDetailsResponseDto;
  ttl: number;
}

const CACHE_EXPIRATION = 1000 * 30; // 30 Sekunden

type TipgroupDetailsState = {
  _selectedTipgroupId: number | null;
  _selectedSeasonId: number | null;
  _selectedMatchdayId: number | null;
  _loadedMatchdays: Map<number, MatchdayCache>;
  _matchdayOverview: MatchdayOverviewResponseDto[] | null;
  _tipgroupDetails: TipgroupDetailsResponseDto | null;
  _hasError: boolean;
  _isReloading: boolean;
  _isLoading: {
    tipgroupDetails: boolean;
    initial: boolean;
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
  _isReloading: false,
  _isLoading: {
    tipgroupDetails: false,
    initial: false,
    matchday: false,
  },
};

export const TipgroupDetailsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    getCurrentMatchday: computed(() => {
      const id = store._selectedMatchdayId();
      const cache = store._loadedMatchdays();

      if (id !== null) {
        const loadedCache = cache.get(id);
        return loadedCache ? loadedCache.data : null;
      }

      return null;
    }),

    getSelectedMatchdayId: computed(() => store._selectedMatchdayId),
    getTipgroupDetails: computed(() => store._tipgroupDetails()),
    getMatchdayOverview: computed(() => store._matchdayOverview),
    isLoading: computed(() => store._isLoading),
    isReloadingMatchday: computed(() => {
      console.log(store._isReloading());
      return store._isReloading();
    }),
    hasError: computed(() => store._hasError()),
  })),

  withMethods((store) => ({
    loadTipgroupDetailsSuccess: (tipgroupDetails: TipgroupDetailsResponseDto) => {
      patchState(store, {
        _tipgroupDetails: tipgroupDetails,
        _selectedSeasonId: tipgroupDetails.currentSeasonId,
        _hasError: false,
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

    getMatchdaySuccess: (data?: MatchdayDetailsResponseDto) => {
      console.log('MATCHDAY SUCCESS');
      patchState(store, {
        _loadedMatchdays: data
          ? new Map(store._loadedMatchdays()).set(data.matchdayId, { data: data, ttl: Date.now() })
          : store._loadedMatchdays(),
        _hasError: false,
        _isLoading: { ...store._isLoading(), matchday: false },
        _isReloading: !store._isReloading(),
      });
    },

    getMatchdayFailure: () => {
      patchState(store, {
        _isLoading: { ...store._isLoading(), matchday: false },
        _isReloading: !store._isReloading(),
        _hasError: true,
      });
    },

    loadInitialDataSuccess: (
      currentMatchday: MatchdayDetailsResponseDto,
      allMatchdays: MatchdayOverviewResponseDto[]
    ) => {
      patchState(store, {
        _loadedMatchdays: new Map(store._loadedMatchdays()).set(currentMatchday.matchdayId, {
          data: currentMatchday,
          ttl: Date.now(),
        }),
        _matchdayOverview: allMatchdays,
        _selectedMatchdayId: currentMatchday.matchdayId,
        _isLoading: { ...store._isLoading(), initial: false },
      });
    },

    loadInitialDataFailure: (error: any) => {
      patchState(store, {
        _isLoading: { ...store._isLoading(), initial: false },
        _hasError: true,
      });
    },
  })),

  withMethods((store, tipgroupService = inject(TipgroupService)) => ({
    loadInitialData: rxMethod<{ tipgroupId: number }>(
      pipe(
        tap(({ tipgroupId }) => {
          patchState(store, {
            _isLoading: { ...store._isLoading(), tipgroupDetails: true, initial: true },
            _selectedTipgroupId: Number(tipgroupId),
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
            current: tipgroupService.getCurrentMatchdayDetails(
              tipgroupDetails.id,
              tipgroupDetails.currentSeasonId || 0
            ),
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

    loadMatchdayDetails: rxMethod<{ matchdayId: number | null; reload: boolean }>(
      pipe(
        filter((data) => data !== null && data.matchdayId !== null),
        debounceTime(500),
        tap((data) => {
          const cachedMatchday = store._loadedMatchdays().get(data.matchdayId!);
          if (!cachedMatchday) {
            patchState(store, {
              _isLoading: { ...store._isLoading(), matchday: true },
              _isReloading: data.reload,
              _selectedMatchdayId: data.matchdayId,
            });
          } else {
            patchState(store, {
              _isLoading: { ...store._isLoading(), matchday: false },
              _isReloading: data.reload,
              _selectedMatchdayId: data.matchdayId,
            });
          }
        }),
        switchMap((data) => {
          const cachedMatchday = store._loadedMatchdays().get(data.matchdayId!);
          const now = Date.now();

          if (cachedMatchday && cachedMatchday.ttl) {
            const lastUpdated = new Date(cachedMatchday.ttl).getTime();
            if (now - lastUpdated < CACHE_EXPIRATION) {
              // Use Data from Cache
              setTimeout(() => {
                patchState(store, { _isReloading: false });
              }, 0);
              return of(null);
            }
          }
          return tipgroupService
            .getMatchdayDetails(store._selectedTipgroupId()!, store._selectedSeasonId()!, data.matchdayId!)
            .pipe(
              tap((data) => store.getMatchdaySuccess(data)),
              catchError(() => {
                store.getMatchdayFailure();
                return EMPTY;
              })
            );
        })
      )
    ),
  }))
);
