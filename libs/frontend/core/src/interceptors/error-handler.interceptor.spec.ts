import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { ErrorManagementService, NotificationService, NotificationType } from '@tippapp/frontend/utils';
import { of, throwError } from 'rxjs';
import { errorHandlerInterceptor } from './error-handler.interceptor';
import { InterceptorService } from './interceptor.service';

describe('errorHandlerInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorHandlerInterceptor(req, next));

  const mockRequest = new HttpRequest('GET', '/api');
  const nextMock = jest.fn(() => of({} as HttpEvent<any>));

  const mockNotificationService = {
    showTypeMessage: jest.fn(),
  };
  const mockErrorManagementService = {
    getMessageForErrorCode: jest.fn((code: string) => `Error-Message: ${code}`),
  };
  const mockInterceptorService = {
    handleTokenRefresh: jest.fn(),
    addAuthTokenToHeader: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: ErrorManagementService,
          useValue: mockErrorManagementService,
        },
        { provide: InterceptorService, useValue: mockInterceptorService },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should handle backend error with error code', (done) => {
    const error = { status: 400, error: { code: 'SOME_CODE' } };
    const next = jest.fn().mockReturnValue(throwError(() => error));
    interceptor(mockRequest, next).subscribe({
      error: (err) => {
        expect(mockErrorManagementService.getMessageForErrorCode).toHaveBeenCalledWith('SOME_CODE');
        expect(mockNotificationService.showTypeMessage).toHaveBeenCalledWith(
          { message: 'Error-Message: SOME_CODE' },
          NotificationType.ERROR
        );
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should handle validation error (422) with validationMessages', (done) => {
    const error = {
      status: 422,
      error: { validationMessages: ['Email missing'] },
    };
    const next = jest.fn().mockReturnValue(throwError(() => error));
    interceptor(mockRequest, next).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should handle generic error', (done) => {
    const error = { status: 500, error: { message: 'Serverfehler' } };
    const next = jest.fn().mockReturnValue(throwError(() => error));
    interceptor(mockRequest, next).subscribe({
      error: (err) => {
        expect(mockNotificationService.showTypeMessage).toHaveBeenCalledWith(
          {
            message: 'Ein unbekannter Fehler ist aufgetreten. Versuche es später erneut.',
          },
          NotificationType.ERROR
        );
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should handle token-refresh if error is 401 and route is not a auth-route', (done) => {
    const error = { status: 401, error: {}, url: '/api/some-protected-route' };
    const req = new HttpRequest('GET', '/api/some-protected-route');
    const next = jest.fn().mockReturnValue(throwError(() => error));
    mockInterceptorService.handleTokenRefresh.mockReturnValue(of('token-refreshed'));

    interceptor(req, next).subscribe({
      next: () => {
        expect(mockInterceptorService.handleTokenRefresh).toHaveBeenCalledWith(next, req);
        done();
      },
    });
  });

  it('should not handle token-refresh if error is 401 and route is an auth-route', (done) => {
    const error = { status: 401, error: {}, url: '/api/auth/login' };
    const req = new HttpRequest('GET', '/api/auth/login');
    const next = jest.fn().mockReturnValue(throwError(() => error));
    mockInterceptorService.handleTokenRefresh.mockClear();

    interceptor(req, next).subscribe({
      error: (err) => {
        expect(mockInterceptorService.handleTokenRefresh).not.toHaveBeenCalled();
        expect(err).toBe(error);
        done();
      },
    });
  });
});
