import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Router } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthResponseDto, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { NotificationService, NotificationType } from '../notifications/notification.service';
import { AuthService } from './auth.service';
import { ENVIRONMENT } from '../environments/environment.token';
import { TokenStorageService } from './token-storage.service';
import { ErrorManagementService } from '../error-management/error-management.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const routerMock = {
    navigate: jest.fn(),
  };

  const environmentMock = {
    apiUrl: 'testUrl/',
  };

  const tokenStorageServiceMock = {
    getRefreshToken: jest.fn(),
  };

  const notificationServiceMock = {
    showTypeMessage: jest.fn(),
  };

  const errorManagementServiceMock = {
    getMessageForErrorCode: jest.fn().mockReturnValue('Error Message'),
  };

  const mocks = {
    get apiAuthResponse(): AuthResponseDto {
      return {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
    },

    get registerDto(): RegisterDto {
      return {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
      };
    },

    get loginDto(): LoginDto {
      return {
        email: 'testuser@email.com',
        password: 'testpassword',
      };
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ENVIRONMENT,
          useValue: environmentMock,
        },
        {
          provide: TokenStorageService,
          useValue: tokenStorageServiceMock,
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
        {
          provide: ErrorManagementService,
          useValue: errorManagementServiceMock,
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST-Request for Registration', () => {
    service.registerNewUser(mocks.registerDto).subscribe((response) => {
      expect(response).toEqual(mocks.apiAuthResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mocks.registerDto);

    req.flush(mocks.apiAuthResponse);
  });

  it('should send a POST-Request for login', () => {
    service.loginUser(mocks.loginDto).subscribe((response) => {
      expect(response).toEqual(mocks.apiAuthResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mocks.loginDto);

    req.flush(mocks.apiAuthResponse);
  });

  it('should send a POST-Request for refreshing the Access-Token', fakeAsync(() => {
    tokenStorageServiceMock.getRefreshToken.mockResolvedValue('refreshToken');

    service.refreshAccessToken().subscribe((response) => {
      expect(response).toEqual(mocks.apiAuthResponse);
    });

    tick();
    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/refresh`);
    expect(req.request.method).toBe('POST');

    req.flush(mocks.apiAuthResponse);
  }));

  it('should throw an Error on refreshing the Access-Token if no RefreshToken exists', (done) => {
    tokenStorageServiceMock.getRefreshToken.mockResolvedValue(null);

    service.refreshAccessToken().subscribe({
      error: () => {
        expect(notificationServiceMock.showTypeMessage).toHaveBeenCalledWith(expect.anything(), NotificationType.ERROR);
        expect(errorManagementServiceMock.getMessageForErrorCode).toHaveBeenCalledWith('AUTH.INVALID_REFRESH_TOKEN');
        done();
      },
    });

    httpTesting.expectNone(`${service.BACKEND_URL}auth/refresh`);
  });

  it('should navigate to login-page', () => {
    service.logoutAndRedirect();
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
