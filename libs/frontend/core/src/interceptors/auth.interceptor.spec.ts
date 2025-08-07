import {TestBed} from '@angular/core/testing';
import {HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest} from '@angular/common/http';

import {signal} from "@angular/core";
import {AuthStore} from "@tippapp/frontend/utils";
import {firstValueFrom, of, throwError} from "rxjs";
import {authInterceptor} from "./auth.interceptor";
import {AuthInterceptorService} from "./auth-interceptor.service";


describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  const mockRequest = new HttpRequest('GET', '/api');

  const nextMock = jest.fn(() => of({} as HttpEvent<any>));

  const mockAuthInterceptorService = {
    isRefreshing: false,
    refreshTokenSignal: signal<string | null>(null)

  }

  const mockAuthStore = {
    accessToken: signal<string | null>(null),
    isAuthenticated: jest.fn().mockReturnValue(false),
    isLoading: jest.fn().mockReturnValue(false),
    refreshAccessToken: jest.fn(),
    logoutAndRedirect: jest.fn(),
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore
        },
        {
          provide: AuthInterceptorService,
          useValue: mockAuthInterceptorService
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass request without Token if no token available', (done) => {
    mockAuthStore.accessToken.set(null);

    interceptor(mockRequest, nextMock).subscribe(() => {
      expect(nextMock).toHaveBeenCalledWith(mockRequest);
      expect(mockRequest.headers.has('Authorization')).toBe(false);
      done();
    });
  });

  it('should add the authorization-header to the request if token is available', (done) => {
    const accessToken = 'test-token';
    mockAuthStore.accessToken.set(accessToken);

    interceptor(mockRequest, nextMock).subscribe(() => {
      expect(nextMock).toHaveBeenCalled();
      const modifiedRequest = Array.from(nextMock.mock.calls[0])[0] as HttpRequest<any>;
      expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${accessToken}`);
      done();
    });
  });

  it('should pass the request if no Unauthorized-Error', async () => {
    const mockError = new HttpErrorResponse({status: 500, statusText: 'Internal Server Error'});
    nextMock.mockReturnValue(throwError(() => mockError));

    try {
      await firstValueFrom(interceptor(mockRequest, nextMock));
    } catch (error: any) {
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
    }
    expect(mockAuthStore.refreshAccessToken).not.toHaveBeenCalled();
    expect(mockAuthStore.logoutAndRedirect).not.toHaveBeenCalled();
  });

  it('should handle a 401 error and initiate a token refresh', async () => {
    nextMock.mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 401})));

    //Simulate refreshed accessToken
    mockAuthStore.accessToken.set('access-token');
    nextMock.mockReturnValueOnce(of({} as HttpEvent<any>));

    await firstValueFrom(interceptor(mockRequest, nextMock));

    expect(mockAuthStore.refreshAccessToken).toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledTimes(2);

    const secondRequest = Array.from(nextMock.mock.calls[1])[0] as HttpRequest<any>;
    expect(secondRequest.headers.get('Authorization')).toBe('Bearer access-token');
  });

  it('should pass 401-Error if refresh Token failed', async () => {
    nextMock.mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 401})));

    mockAuthStore.refreshAccessToken.mockImplementationOnce(() => {
      mockAuthStore.accessToken.set(null);
    });

    try {
      await firstValueFrom(interceptor(mockRequest, nextMock));
    } catch (error) {
      expect(error).toBe('No AccessToken Provided!');
    }

    expect(mockAuthStore.logoutAndRedirect).toHaveBeenCalled();
  });

  it('should wait for Token-Refresh if another Request already started refreshing', async () => {
    mockAuthInterceptorService.isRefreshing = true;

    setTimeout(() => {
      mockAuthInterceptorService.refreshTokenSignal.set('refreshed-token');
    }, 10);

    nextMock.mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 401})));
    nextMock.mockReturnValueOnce(of({} as HttpEvent<any>));

    await firstValueFrom(interceptor(mockRequest, nextMock));

    expect(mockAuthStore.refreshAccessToken).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledTimes(2);

    const secondRequest = Array.from(nextMock.mock.calls[1])[0] as HttpRequest<any>;
    expect(secondRequest.headers.get('Authorization')).toBe('Bearer refreshed-token');
  });
});
