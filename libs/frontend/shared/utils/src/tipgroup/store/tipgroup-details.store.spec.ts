import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TipgroupDetailsStore } from './tipgroup-details.store';
import { TipgroupService } from '../tipgroup.service';

describe('TipgroupDetailsStore', () => {
  let store: any;

  const mockTipgroupDetails = { id: 1, currentSeasonId: 2024 };
  const mockMatchday = { matchdayId: 5, name: 'Spieltag 5' };
  const mockOverview = [{ matchdayId: 5, name: 'Spieltag 5', orderId: 1 }];

  const tipgroupServiceMock = {
    getTipgroupDetails: jest.fn(),
    getCurrentMatchdayDetails: jest.fn(),
    getMatchdayOverview: jest.fn(),
    getMatchdayDetails: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipgroupDetailsStore, { provide: TipgroupService, useValue: tipgroupServiceMock }],
    });

    store = TestBed.inject(TipgroupDetailsStore);
  });

  it('should start with initialState', () => {
    expect(store.getTipgroupDetails()).toBeNull();
    expect(store.hasError()).toBe(false);
    expect(store.isLoading().initial).toBe(false);
  });

  describe('loadInitialData', () => {
    it('should load data successful and update state', () => {
      tipgroupServiceMock.getTipgroupDetails.mockReturnValue(of(mockTipgroupDetails as any));
      tipgroupServiceMock.getCurrentMatchdayDetails.mockReturnValue(of(mockMatchday as any));
      tipgroupServiceMock.getMatchdayOverview.mockReturnValue(of(mockOverview as any));

      store.loadInitialData({ tipgroupId: 1 });

      expect(store.getTipgroupDetails()).toEqual(mockTipgroupDetails);
      expect(store.getSelectedMatchdayId()).toBe(5);
      expect(store.getMatchdayOverview()).toEqual(mockOverview);
      expect(store.getCurrentMatchday()).toEqual(mockMatchday);
      expect(store.isLoading().initial).toBe(false);
    });

    it('should set hasError to true if call fails', () => {
      tipgroupServiceMock.getTipgroupDetails.mockReturnValue(throwError(() => new Error('API Error')));

      store.loadInitialData({ tipgroupId: 1 });

      expect(store.hasError()).toBe(true);
      expect(store.isLoading().tipgroupDetails).toBe(false);
    });
  });

  describe('loadMatchdayDetails (Caching & RxMethod)', () => {
    beforeEach(() => {
      tipgroupServiceMock.getTipgroupDetails.mockReturnValue(of(mockTipgroupDetails as any));
      tipgroupServiceMock.getCurrentMatchdayDetails.mockReturnValue(of(mockMatchday as any));
      tipgroupServiceMock.getMatchdayOverview.mockReturnValue(of(mockOverview as any));
      store.loadInitialData({ tipgroupId: 1 });
    });

    it('should load new data if id is not in the cache', () => {
      const newMatchday = { matchdayId: 6, name: 'Spieltag 6' };
      tipgroupServiceMock.getMatchdayDetails.mockReturnValue(of(newMatchday as any));

      store.loadMatchdayDetails({ matchdayId: 6, reload: false });

      expect(tipgroupServiceMock.getMatchdayDetails).toHaveBeenCalledWith(1, 2024, 6);
      expect(store.getCurrentMatchday()).toEqual(newMatchday);
    });

    it('should use cache data if last call is less than 30 seconds ago', () => {
      const cachedData = { matchdayId: 10, name: 'Cached' };
      tipgroupServiceMock.getMatchdayDetails.mockReturnValue(of(cachedData as any));
      store.loadMatchdayDetails({ matchdayId: 10, reload: false });

      jest.clearAllMocks();

      // second call within cache
      store.loadMatchdayDetails({ matchdayId: 10, reload: false });

      expect(tipgroupServiceMock.getMatchdayDetails).not.toHaveBeenCalled();
      expect(store.getCurrentMatchday()).toEqual(cachedData);
    });
  });

  describe('withComputed / Selectors', () => {
    it('getCurrentMatchday should return null if matchday not exists', () => {
      import('@ngrx/signals').then((m) => {
        m.patchState(store, { _selectedMatchdayId: 999 });
        expect(store.getCurrentMatchday()).toBeNull();
      });
    });
  });
});
