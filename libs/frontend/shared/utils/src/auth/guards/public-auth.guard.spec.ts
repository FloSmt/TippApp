import {TestBed} from '@angular/core/testing';
import {CanActivateFn} from '@angular/router';

import {publicAuthGuard} from './public-auth.guard';

describe('publicAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
