import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  MatchdayDetailsResponseDto,
  MatchdayOverviewResponseDto,
  MatchResponseDto,
  TipgroupDetailsResponseDto,
} from '@tippapp/shared/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  forkJoin,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
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
    getTipgroupDetails: computed(() => store._tipgroupDetails),
    getMatchdayOverview: computed(() => store._matchdayOverview),
    isLoading: computed(() => store._isLoading),
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

    getMatchdaySuccess: (data: MatchdayDetailsResponseDto) => {
      patchState(store, {
        _loadedMatchdays: new Map(store._loadedMatchdays()).set(data.matchdayId, { data: data, ttl: Date.now() }),
        _isLoading: { ...store._isLoading(), matchday: false },
      });
    },

    getMatchdayFailure: () => {
      patchState(store, {
        _isLoading: { ...store._isLoading(), matchday: false },
        _hasError: true,
      });
    },

    loadInitialDataSuccess: (
      currentMatchday: MatchdayDetailsResponseDto,
      allMatchdays: MatchdayOverviewResponseDto[]
    ) => {
      const dummyMatches: MatchResponseDto[] = [
        {
          matchId: 77256,
          scheduledDateTime: '2025-08-22T20:30:00',
          lastUpdatedDateTime: '2025-08-22T20:30:00',
          isFinished: true,
          homeTeam: {
            teamId: 40,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            logoUrl:
              'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg',
          },
          awayTeam: {
            teamId: 1635,
            name: 'RB Leipzig',
            shortName: 'Leipzig',
            logoUrl: 'https://i.imgur.com/Rpwsjz1.png',
          },
          scores: {
            homeTeamScore: 6,
            awayTeamScore: 0,
          },
        },
        {
          matchId: 77256,
          scheduledDateTime: '2025-12-31T20:30:00',
          lastUpdatedDateTime: '2025-12-31T20:30:00',
          isFinished: false,
          homeTeam: {
            teamId: 40,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            logoUrl:
              'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg',
          },
          awayTeam: {
            teamId: 1635,
            name: 'RB Leipzig',
            shortName: 'Leipzig',
            logoUrl: 'https://i.imgur.com/Rpwsjz1.png',
          },
          scores: {
            homeTeamScore: 0,
            awayTeamScore: 2,
          },
        },
        {
          matchId: 77256,
          scheduledDateTime: '2025-12-29T23:09:00',
          lastUpdatedDateTime: '2025-12-29T23:09:00',
          isFinished: false,
          homeTeam: {
            teamId: 40,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            logoUrl:
              'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg',
          },
          awayTeam: {
            teamId: 1635,
            name: 'RB Leipzig',
            shortName: 'Leipzig',
            logoUrl: 'https://i.imgur.com/Rpwsjz1.png',
          },
          scores: {
            homeTeamScore: 6,
            awayTeamScore: 0,
          },
        },
        {
          matchId: 77256,
          scheduledDateTime: '2025-12-29T18:30:00',
          lastUpdatedDateTime: '2025-08-22T20:30:00',
          isFinished: false,
          homeTeam: {
            teamId: 40,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            logoUrl:
              'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg',
          },
          awayTeam: {
            teamId: 1635,
            name: 'RB Leipzig',
            shortName: 'Leipzig',
            logoUrl: 'https://i.imgur.com/Rpwsjz1.png',
          },
          scores: {
            homeTeamScore: 0,
            awayTeamScore: 0,
          },
        },
        {
          matchId: 77256,
          scheduledDateTime: '2025-12-29T19:30:00',
          lastUpdatedDateTime: '2025-08-22T20:30:00',
          isFinished: false,
          homeTeam: {
            teamId: 40,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            logoUrl:
              'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg',
          },
          awayTeam: {
            teamId: 1635,
            name: 'RB Leipzig',
            shortName: 'Leipzig',
            logoUrl: 'https://i.imgur.com/Rpwsjz1.png',
          },
          scores: {
            homeTeamScore: 0,
            awayTeamScore: 0,
          },
        },
      ];
      const dummyMatchday = currentMatchday;
      dummyMatchday.matchList = dummyMatches;
      patchState(store, {
        _loadedMatchdays: new Map(store._loadedMatchdays()).set(currentMatchday.matchdayId, {
          // data: currentMatchday,
          data: dummyMatchday,
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

    loadMatchdayDetails: rxMethod<number | null>(
      pipe(
        distinctUntilChanged(),
        filter((id) => id !== null),
        debounceTime(500),
        tap((id) => {
          const cachedMatchday = store._loadedMatchdays().get(id);
          if (cachedMatchday) {
            // show cached data directly to the user
            patchState(store, { _isLoading: { ...store._isLoading(), matchday: false }, _selectedMatchdayId: id });
          } else {
            patchState(store, { _isLoading: { ...store._isLoading(), matchday: true }, _selectedMatchdayId: id });
          }
        }),
        switchMap((id) => {
          const cachedMatchday = store._loadedMatchdays().get(id);
          const now = Date.now();

          if (cachedMatchday && cachedMatchday.ttl) {
            const lastUpdated = new Date(cachedMatchday.ttl).getTime();
            if (now - lastUpdated < CACHE_EXPIRATION) {
              return of(null);
            }
          }
          return tipgroupService.getMatchdayDetails(store._selectedTipgroupId()!, store._selectedSeasonId()!, id).pipe(
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
