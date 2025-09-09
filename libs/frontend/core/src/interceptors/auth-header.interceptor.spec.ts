import { TestBed } from '@angular/core/testing';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';

import { signal } from '@angular/core';
import { AuthStore } from '@tippapp/frontend/utils';
import { of } from 'rxjs';
import { authHeaderInterceptor } from './auth-header.interceptor';

describe('authHeaderInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authHeaderInterceptor(req, next));

  const mockRequest = new HttpRequest('GET', '/api');

  const nextMock = jest.fn(() => of({} as HttpEvent<any>));

  const mockAuthStore = {
    accessToken: signal<string | null>(null),
    isAuthenticated: jest.fn().mockReturnValue(false),
    isLoading: jest.fn().mockReturnValue(false),
    refreshAccessToken: jest.fn(),
    logoutAndRedirect: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore,
        },
      ],
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
      const modifiedRequest = Array.from(
        nextMock.mock.calls[0]
      )[0] as HttpRequest<any>;
      expect(modifiedRequest.headers.get('Authorization')).toBe(
        `Bearer ${accessToken}`
      );
      done();
    });
  });
});
