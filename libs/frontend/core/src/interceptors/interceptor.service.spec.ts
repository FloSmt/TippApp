import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { AuthStore } from '@tippapp/frontend/utils';
import { of, throwError } from 'rxjs';
import { InterceptorService } from './interceptor.service';

class MockAuthStore {
  private _accessToken: string | null = 'mock-token';
  private _isLoading = false;
  refreshAccessToken = jest.fn();
  logoutAndRedirect = jest.fn();
  accessToken = () => this._accessToken;
  isLoading = () => this._isLoading;

  setAccessToken(token: string | null) {
    this._accessToken = token;
  }

  setLoading(loading: boolean) {
    this._isLoading = loading;
  }
}

describe('InterceptorService', () => {
  let service: InterceptorService;
  let authStore: MockAuthStore;
  let next: HttpHandlerFn;
  let request: HttpRequest<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InterceptorService,
        { provide: AuthStore, useClass: MockAuthStore },
      ],
    });
    service = TestBed.inject(InterceptorService);
    authStore = TestBed.inject(AuthStore) as any;
    request = new HttpRequest('GET', '/test');
    next = jest.fn().mockReturnValue(of(new HttpResponse({ status: 200 })));
  });

  describe('addAuthTokenToHeader', () => {
    it('should set auth-token in the header', () => {
      const token = 'test-token';
      const reqWithHeader = service.addAuthTokenToHeader(request, token);
      expect(reqWithHeader.headers.get('Authorization')).toBe(
        'Bearer test-token'
      );
    });
  });

  describe('handleTokenRefresh', () => {
    it('should refresh Token and send Request with new token again', async () => {
      authStore.setAccessToken('new-token');
      Object.defineProperty(service, 'tokenRefresh$', {
        value: of('new-token'),
      });
      jest.spyOn(authStore, 'isLoading').mockReturnValue(false);
      await new Promise((resolve) => {
        service.handleTokenRefresh(next, request).subscribe(() => {
          expect(authStore.refreshAccessToken).toHaveBeenCalled();
          expect(next).toHaveBeenCalled();
          resolve(null);
        });
      });
    });

    it('should logoutAndRedirect if no token is available', async () => {
      authStore.setAccessToken(null);
      Object.defineProperty(service, 'tokenRefresh$', { value: of(null) });
      jest.spyOn(authStore, 'isLoading').mockReturnValue(false);
      await new Promise((resolve) => {
        service.handleTokenRefresh(next, request).subscribe({
          error: (err) => {
            expect(authStore.logoutAndRedirect).toHaveBeenCalled();
            expect(err).toBe('No AccessToken Provided!');
            resolve(null);
          },
        });
      });
    });

    it('should call logoutAndRedirect on refresh-error', async () => {
      Object.defineProperty(service, 'tokenRefresh$', {
        value: throwError(() => 'refresh-error'),
      });
      jest.spyOn(authStore, 'isLoading').mockReturnValue(false);
      await new Promise((resolve) => {
        service.handleTokenRefresh(next, request).subscribe({
          error: (err) => {
            expect(authStore.logoutAndRedirect).toHaveBeenCalled();
            expect(err).toBe('refresh-error');
            resolve(null);
          },
        });
      });
    });

    it('should wait for refreshTokenSignal$ and send request with new token if already refreshing', async () => {
      service.isRefreshing = true;
      // Simuliere, dass refreshTokenSignal$ ein neues Token liefert
      const newToken = 'waited-token';
      Object.defineProperty(service, 'refreshTokenSignal$', {
        value: of(newToken),
      });
      const nextSpy = jest
        .fn()
        .mockReturnValue(of(new HttpResponse({ status: 200 })));
      await new Promise((resolve) => {
        service.handleTokenRefresh(nextSpy, request).subscribe(() => {
          expect(nextSpy).toHaveBeenCalled();
          const calledWith = nextSpy.mock.calls[0][0];
          expect(calledWith.headers.get('Authorization')).toBe(
            'Bearer ' + newToken
          );
          resolve(null);
        });
      });
    });
  });
});
