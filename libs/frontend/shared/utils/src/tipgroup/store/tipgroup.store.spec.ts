import { TestBed } from '@angular/core/testing';
import { TipgroupEntryResponseDto } from '@tippapp/shared/data-access';
import { delay, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TipgroupService } from '../tipgroup.service';
import { ErrorManagementService } from '../../error-management/error-management.service';
import { LoadingState, TipgroupStore } from './tipgroup.store';

describe('TipgroupStore', () => {
  let store: InstanceType<typeof TipgroupStore>;
  let tipgroupService: TipgroupService;

  const mockErrorManagementService = {
    handleApiError: jest.fn(),
  };

  const tipgroupServiceMock = {
    getAvailableTipgroups: jest.fn(),
  };

  const mocks = {
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
          useValue: mockErrorManagementService,
        },
      ],
    });

    store = TestBed.inject(TipgroupStore);
    tipgroupService = TestBed.inject(TipgroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start with initialState', () => {
    expect(store.isLoading()).toBe(true);
    expect(store.availableTipgroups()).toBeNull();
    expect(store.hasError()).toBeFalsy();
    expect(store.loadingState()).toBe(LoadingState.INITIAL);
  });

  describe('Computed properties', () => {
    it('should set hasTipgroups to true if availableTipgroups are not null', () => {
      store.loadAvailableGroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.hasTipgroups()).toBe(true);
      expect(store.availableTipgroups()).toStrictEqual(
        mocks.availableTipgroupsMock
      );
    });

    it('should set hasError to true if loadingState is Error', () => {
      store.loadAvailableGroupsFailure();
      expect(store.hasError()).toBe(true);
      expect(store.loadingState()).toBe(LoadingState.ERROR);
    });

    it('should set isLoading if LoadingState is Loading or Initial', () => {
      expect(store.isLoading()).toBeTruthy();
      store.loadAvailableGroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.isLoading()).toBeFalsy();
    });
  });

  describe('Synchronous methods', () => {
    it('should patch State for loadAvailableGroupsSuccess correctly', () => {
      store.loadAvailableGroupsSuccess(mocks.availableTipgroupsMock);
      expect(store.isLoading()).toBe(false);
      expect(store.availableTipgroups()).toStrictEqual(
        mocks.availableTipgroupsMock
      );
      expect(store.hasError()).toBeFalsy();
    });

    it('should patch State for loadAvailableGroupsFailure correctly', () => {
      store.loadAvailableGroupsFailure();
      expect(store.isLoading()).toBe(false);
      expect(store.availableTipgroups()).toBeNull();
    });
  });

  describe('rxMethod', () => {
    describe('loadAvailableTipgroups', () => {
      it('should patch state on success correctly', (done) => {
        jest
          .spyOn(tipgroupService, 'getAvailableTipgroups')
          .mockReturnValue(of(mocks.availableTipgroupsMock).pipe(delay(1)));

        store.loadAvailableTipgroups({ reload: false });

        expect(store.isLoading()).toBe(true);
        expect(store.loadingState()).toBe(LoadingState.INITIAL);
        expect(tipgroupServiceMock.getAvailableTipgroups).toHaveBeenCalledTimes(
          1
        );

        setTimeout(() => {
          expect(store.isLoading()).toBe(false);
          expect(store.availableTipgroups()).toStrictEqual(
            mocks.availableTipgroupsMock
          );
          expect(store.loadingState()).toBe(LoadingState.LOADED);
          done();
        }, 5);
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });

        jest
          .spyOn(tipgroupService, 'getAvailableTipgroups')
          .mockReturnValue(throwError(() => mockError));

        store.loadAvailableTipgroups({ reload: true });

        expect(store.isLoading()).toBe(false);
        expect(store.availableTipgroups()).toBeNull();
        expect(tipgroupServiceMock.getAvailableTipgroups).toHaveBeenCalledTimes(
          1
        );
        expect(store.loadingState()).toBe(LoadingState.ERROR);
      });
    });
  });
});
