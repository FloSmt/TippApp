import { TestBed } from '@angular/core/testing';
import { AvailableLeagueResponseDto, CreateTipgroupDto, TipgroupEntryResponseDto } from '@tippapp/shared/data-access';
import { HttpErrorResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { NotificationService, NotificationType } from '../../notifications/notification.service';
import { TipgroupService } from '../tipgroup.service';
import { ErrorManagementService } from '../../error-management/error-management.service';
import { LoadingState, TipgroupStore } from './tipgroup.store';

describe('TipgroupStore', () => {
  let store: InstanceType<typeof TipgroupStore>;

  const errorManagementServiceMock = {
    handleApiError: jest.fn(),
  };

  const notificationServiceMock = {
    showTypeMessage: jest.fn(),
  };

  const tipgroupServiceMock = {
    getAvailableTipgroups: jest.fn(),
    getAvailableLeagues: jest.fn(),
    createTipgroup: jest.fn(),
  };

  const mocks = {
    get createTipgroupDtoMock(): CreateTipgroupDto {
      return {
        name: 'New Tipgroup',
        password: 'securepassword',
        leagueShortcut: 'bl1',
        currentSeason: 2024,
      };
    },
    get tipgroupEntryResponseDtoMock(): TipgroupEntryResponseDto {
      return {
        id: 1,
        name: 'Mock Tipgroup',
      };
    },
    get availableLeaguesMock(): AvailableLeagueResponseDto[] {
      return [
        {
          leagueId: 1,
          leagueName: 'League 1',
        },
        {
          leagueId: 2,
          leagueName: 'League 2',
        },
      ] as unknown as AvailableLeagueResponseDto[];
    },
    get availableTipgroupsMock(): TipgroupEntryResponseDto[] {
      return [
        {
          id: 1,
          name: 'Group 1',
        },
        {
          id: 2,
          name: 'Group 2',
        },
      ];
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TipgroupService,
          useValue: tipgroupServiceMock,
        },
        {
          provide: ErrorManagementService,
          useValue: errorManagementServiceMock,
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
      ],
    });

    store = TestBed.inject(TipgroupStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should start with initialState', () => {
    expect(store.availableLeaguesState()).toEqual({
      data: null,
      error: null,
      isLoading: false,
    });
    expect(store.createTipgroupState()).toEqual({
      error: null,
      isLoading: false,
    });
    expect(store.availableTipgroupsState()).toEqual({
      data: null,
      loadingState: LoadingState.INITIAL,
    });
  });

  describe('Computed properties', () => {
    it('hasTipgroups should return true if tipgroups are available', () => {
      store.loadAvailableTipgroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.hasTipgroups()).toBe(true);
      expect(store.availableTipgroupsState.data()).toStrictEqual(mocks.availableTipgroupsMock);
    });

    it('hasAvailableLeaguesError should return true if loading available Leagues failed', () => {
      const errorResponse = new HttpErrorResponse({ error: 'test-error' });
      store.loadAvailableLeaguesFailure(errorResponse);
      expect(store.hasAvailableLeaguesError()).toBe(true);
      expect(store.availableLeaguesState.error()).toBe(errorResponse);
    });

    it('hasErrorOnLoadingTipgroups should return true if loading available Tipgroups failed', () => {
      store.loadAvailableTipgroupsFailure();
      expect(store.hasErrorOnLoadingTipgroups()).toBe(true);
      expect(store.availableTipgroupsState.loadingState()).toBe(LoadingState.ERROR);
    });

    it('isLoadingTipgroups should return true if loadingState is initial or loading', () => {
      expect(store.isLoadingTipgroups()).toBe(true);

      store.loadAvailableTipgroups({ reload: false });
      expect(store.isLoadingTipgroups()).toBe(true);

      store.loadAvailableTipgroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.isLoadingTipgroups()).toBe(false);
    });
  });

  describe('Synchronous methods', () => {
    it('loadAvailableTipgroupsSuccess should patch State correctly', () => {
      store.loadAvailableTipgroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.availableTipgroupsState()).toEqual({
        data: mocks.availableTipgroupsMock,
        loadingState: LoadingState.LOADED,
      });
    });

    it('loadAvailableTipgroupsFailure should patch State correctly', () => {
      store.loadAvailableTipgroupsFailure();
      expect(store.availableTipgroupsState()).toEqual({
        data: null,
        loadingState: LoadingState.ERROR,
      });
    });

    it('loadAvailableLeaguesSuccess should patch State correctly', () => {
      store.loadAvailableLeaguesSuccess(mocks.availableLeaguesMock);
      expect(store.availableLeaguesState()).toEqual({
        data: mocks.availableLeaguesMock,
        error: null,
        isLoading: false,
      });
    });

    it('loadAvailableLeaguesFailure should patch State correctly', () => {
      const errorResponse = new HttpErrorResponse({ error: 'test-error' });

      store.loadAvailableLeaguesFailure(errorResponse);
      expect(store.availableLeaguesState()).toEqual({
        data: null,
        error: errorResponse,
        isLoading: false,
      });
    });

    it('createTipgroupSuccess should patch State correctly', () => {
      store.createTipgroupSuccess(mocks.tipgroupEntryResponseDtoMock);
      expect(notificationServiceMock.showTypeMessage).toHaveBeenCalledWith(
        {
          header: 'Tippgruppe erstellt',
          message: mocks.tipgroupEntryResponseDtoMock.name + ' wurde erfolgreich erstellt.',
        },
        NotificationType.SUCCESS
      );
      expect(store.availableTipgroupsState.data()).toContainEqual(mocks.tipgroupEntryResponseDtoMock);
      expect(store.createTipgroupState()).toEqual({
        error: null,
        isLoading: false,
      });
    });

    it('createTipgroupFailure should patch State correctly', () => {
      const errorResponse = new HttpErrorResponse({ error: 'test-error' });

      store.createTipgroupFailure(errorResponse);
      expect(store.createTipgroupState()).toEqual({
        error: errorResponse,
        isLoading: false,
      });
    });
  });

  describe('rxMethod', () => {
    describe('loadAvailableTipgroups', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        tipgroupServiceMock.getAvailableTipgroups.mockReturnValue(of(mocks.availableTipgroupsMock).pipe(delay(10)));

        store.loadAvailableTipgroups({ reload: false });

        // Direkt nach dem Aufruf sollte loadingState INITIAL sein
        expect(store.availableTipgroupsState.loadingState()).toBe(LoadingState.INITIAL);

        // Timer vorspulen, damit das Observable "fertig" ist
        jest.advanceTimersByTime(20);

        // Jetzt sollte der State auf LOADED stehen
        expect(store.availableTipgroupsState.loadingState()).toBe(LoadingState.LOADED);
        expect(store.availableTipgroupsState.data()).toEqual(mocks.availableTipgroupsMock);

        jest.useRealTimers();
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });

        tipgroupServiceMock.getAvailableTipgroups.mockReturnValue(throwError(() => mockError));

        store.loadAvailableTipgroups({ reload: true });

        expect(store.availableTipgroupsState.data()).toBeNull();
        expect(tipgroupServiceMock.getAvailableTipgroups).toHaveBeenCalledTimes(1);
        expect(store.availableTipgroupsState.loadingState()).toEqual(LoadingState.ERROR);
      });
    });

    describe('loadAvailableLeagues', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        tipgroupServiceMock.getAvailableLeagues.mockReturnValue(of(mocks.availableLeaguesMock).pipe(delay(10)));

        store.loadAvailableLeagues();

        expect(store.availableLeaguesState.isLoading()).toBeTruthy();
        expect(tipgroupServiceMock.getAvailableLeagues).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(20);

        expect(store.availableLeaguesState.isLoading()).toBeFalsy();
        expect(store.availableLeaguesState.data()).toEqual(mocks.availableLeaguesMock);
        jest.useRealTimers();
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });

        tipgroupServiceMock.getAvailableLeagues.mockReturnValue(throwError(() => mockError));

        store.loadAvailableLeagues();

        expect(store.availableLeaguesState.data()).toBeNull();
        expect(tipgroupServiceMock.getAvailableLeagues).toHaveBeenCalledTimes(1);
        expect(store.availableLeaguesState.isLoading()).toBeFalsy();
      });
    });

    describe('createTipgroup', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        tipgroupServiceMock.createTipgroup.mockReturnValue(of(mocks.tipgroupEntryResponseDtoMock).pipe(delay(10)));

        store.createTipgroup({
          createTipgroupDto: mocks.createTipgroupDtoMock,
        });

        expect(store.createTipgroupState.isLoading()).toBeTruthy();
        expect(tipgroupServiceMock.createTipgroup).toHaveBeenCalledWith(mocks.createTipgroupDtoMock);

        jest.advanceTimersByTime(20);

        expect(store.createTipgroupState.isLoading()).toBeFalsy();
        expect(store.availableTipgroupsState.data()).toContainEqual(mocks.tipgroupEntryResponseDtoMock);
        jest.useRealTimers();
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });

        tipgroupServiceMock.createTipgroup.mockReturnValue(throwError(() => mockError));

        store.createTipgroup({
          createTipgroupDto: mocks.createTipgroupDtoMock,
        });

        expect(store.createTipgroupState.isLoading()).toBeFalsy();
        expect(tipgroupServiceMock.createTipgroup).toHaveBeenCalledWith(mocks.createTipgroupDtoMock);
      });
    });
  });
});
