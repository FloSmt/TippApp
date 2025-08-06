import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';

import {lastValueFrom} from "rxjs";
import {signal} from "@angular/core";
import {authGuard} from './auth.guard';
import {AuthStore} from '../store/auth.store';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const mockAuthStore = {
    isAuthenticated: signal(false),
    isLoading: signal(false),
    refreshAccessToken: jest.fn(),
    logoutAndRedirect: jest.fn(),
  }

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if the user is Authenticated', () => {
    mockAuthStore.isAuthenticated.set(true);
    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(true);
    expect(mockAuthStore.refreshAccessToken).not.toHaveBeenCalled();
    expect(mockAuthStore.logoutAndRedirect).not.toHaveBeenCalled();
  });

  it('should return true if refreshToken was successful', async () => {
    mockAuthStore.isAuthenticated.set(false);
    mockAuthStore.isLoading.set(false);

    const result$ = executeGuard(dummyRoute, dummyState);
    expect(mockAuthStore.refreshAccessToken).toHaveBeenCalled();

    mockAuthStore.isLoading.set(true);
    mockAuthStore.isAuthenticated.set(true);
    mockAuthStore.isLoading.set(false);

    const finalResult = await lastValueFrom(result$ as any);

    expect(finalResult).toBe(true);
    expect(mockAuthStore.logoutAndRedirect).not.toHaveBeenCalled();
  });

  it('should return false and logout the user if refreshToken failed', async () => {
    mockAuthStore.isAuthenticated.set(false);
    mockAuthStore.isLoading.set(false);

    const result$ = executeGuard(dummyRoute, dummyState);
    expect(mockAuthStore.refreshAccessToken).toHaveBeenCalled();

    mockAuthStore.isLoading.set(true);
    mockAuthStore.isAuthenticated.set(false);
    mockAuthStore.isLoading.set(false);

    const finalResult = await lastValueFrom(result$ as any);

    expect(finalResult).toBe(false);
    expect(mockAuthStore.logoutAndRedirect).toHaveBeenCalled();
  });
});
