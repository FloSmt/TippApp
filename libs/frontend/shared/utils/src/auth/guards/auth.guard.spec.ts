import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';

import {lastValueFrom} from "rxjs";
import {signal} from "@angular/core";
import {authGuard} from './auth.guard';
import {AuthStore} from '../store/auth.store';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const authStoreMock = {
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
          useValue: authStoreMock
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
    authStoreMock.isAuthenticated.set(true);
    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(true);
    expect(authStoreMock.refreshAccessToken).not.toHaveBeenCalled();
    expect(authStoreMock.logoutAndRedirect).not.toHaveBeenCalled();
  });

  it('should return true if refreshToken was successful', async () => {
    authStoreMock.isAuthenticated.set(false);
    authStoreMock.isLoading.set(false);

    const result$ = executeGuard(dummyRoute, dummyState);
    expect(authStoreMock.refreshAccessToken).toHaveBeenCalled();

    authStoreMock.isLoading.set(true);
    authStoreMock.isAuthenticated.set(true);
    authStoreMock.isLoading.set(false);

    const finalResult = await lastValueFrom(result$ as any);

    expect(finalResult).toBe(true);
    expect(authStoreMock.logoutAndRedirect).not.toHaveBeenCalled();
  });

  it('should return false and logout the user if refreshToken failed', async () => {
    authStoreMock.isAuthenticated.set(false);
    authStoreMock.isLoading.set(false);

    const result$ = executeGuard(dummyRoute, dummyState);
    expect(authStoreMock.refreshAccessToken).toHaveBeenCalled();

    authStoreMock.isLoading.set(true);
    authStoreMock.isAuthenticated.set(false);
    authStoreMock.isLoading.set(false);

    const finalResult = await lastValueFrom(result$ as any);

    expect(finalResult).toBe(false);
    expect(authStoreMock.logoutAndRedirect).toHaveBeenCalled();
  });
});
