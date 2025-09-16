import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';

import {signal} from "@angular/core";
import {TokenStorageService} from "../token-storage.service";
import {AuthStore} from "../store/auth.store";
import {publicAuthGuard} from './public-auth.guard';

describe('publicAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicAuthGuard(...guardParameters));

  const authStoreMock = {
    isAuthenticated: signal(false)
  }

  const routerMock = {
    navigate: jest.fn()
  }

  const tokenStorageServiceMock = {
    getRefreshToken: jest.fn()
  }

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: TokenStorageService,
          useValue: tokenStorageServiceMock
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

  it('should return false and navigate if user is already authenticated', () => {
    authStoreMock.isAuthenticated.set(true);
    const result = executeGuard(dummyRoute, dummyState);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(result).toBe(false);
  });

  it('should return false if user is not authenticated but refreshToken is set', async () => {
    authStoreMock.isAuthenticated.set(false);
    tokenStorageServiceMock.getRefreshToken.mockResolvedValue('refreshToken');
    const result = await executeGuard(dummyRoute, dummyState);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(result).toBe(false);
  });

  it('should return true if user is not authenticated and refreshToken is not set', async () => {
    authStoreMock.isAuthenticated.set(false);
    tokenStorageServiceMock.getRefreshToken.mockResolvedValue(null);
    const result = await executeGuard(dummyRoute, dummyState);

    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
