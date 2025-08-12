import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';

import {signal} from "@angular/core";
import {AuthStore} from "../store/auth.store";
import {publicAuthGuard} from './public-auth.guard';

describe('publicAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicAuthGuard(...guardParameters));

  const mockAuthStore = {
    isAuthenticated: signal(false)
  }

  const mockRouter = {
    navigate: jest.fn()
  }

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore
        },
        {
          provide: Router,
          useValue: mockRouter
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
    mockAuthStore.isAuthenticated.set(true);
    const result = executeGuard(dummyRoute, dummyState);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(result).toBe(false);
  });

  it('should return true if user is not authenticated', () => {
    mockAuthStore.isAuthenticated.set(false);
    const result = executeGuard(dummyRoute, dummyState);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
