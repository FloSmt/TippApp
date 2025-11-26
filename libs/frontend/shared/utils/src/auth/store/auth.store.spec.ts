import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApiValidationErrorMessage, AuthResponseDto, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { delay, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorManagementService } from '../../error-management/error-management.service';
import { AuthService, TokenStorageService } from '../index';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  const authServiceMock = {
    registerNewUser: jest.fn(),
    loginUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    logoutAndRedirect: jest.fn(),
  };

  const errorManagementServiceMock = {
    getValidationError: jest.fn(),
  };

  const tokenStorageServiceMock = {
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  };

  const mocks = {
    get authResponse(): AuthResponseDto {
      return {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
    },

    get validationErrorContent(): ApiValidationErrorMessage[] {
      return [
        {
          property: 'email',
          constraints: { isEmail: 'Email must be valid' },
        },
      ];
    },

    get registerDto(): RegisterDto {
      return {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
    },

    get loginDto(): LoginDto {
      return {
        email: 'test@example.com',
        password: 'password123',
      };
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: ErrorManagementService,
          useValue: errorManagementServiceMock,
        },
        {
          provide: TokenStorageService,
          useValue: tokenStorageServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start with initialState', () => {
    expect(store.isLoading()).toBe(false);
    expect(store.accessToken()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  describe('Computed properties', () => {
    it('should set isAuthenticated to true if accessToken is set', () => {
      store.loginSuccess(mocks.authResponse);
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should set hasError to true if an Error is set', () => {
      errorManagementServiceMock.getValidationError.mockReturnValue(mocks.validationErrorContent);
      store.loginFailure(new HttpErrorResponse({ error: 'test-error' }));
      expect(store.hasError()).toBe(true);
      expect(store.error()).toStrictEqual(mocks.validationErrorContent);
    });
  });

  describe('Synchronous methods', () => {
    it('should patch State for registrationSuccess correctly and save refreshToken', () => {
      const newToken = 'new-token-1';
      store.registrationSuccess({ ...mocks.authResponse, accessToken: newToken });
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBe(newToken);
      expect(store.error()).toBeNull();
      expect(tokenStorageServiceMock.setRefreshToken).toHaveBeenCalledWith(mocks.authResponse.refreshToken);
    });

    it('should patch State for registrationFailure correctly', () => {
      const mockError = new HttpErrorResponse({ error: 'test-error' });

      store.registrationFailure(mockError);
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBeNull();
      expect(errorManagementServiceMock.getValidationError).toHaveBeenCalledWith(mockError);
    });

    it('should patch State for logoutAndRedirect correctly and call logoutAndRedirect in AuthService and clear RefreshToken', async () => {
      const loggedInToken = 'logged-in-token';
      await store.loginSuccess({ ...mocks.authResponse, accessToken: loggedInToken });
      expect(store.accessToken()).toBe(loggedInToken);

      await store.logoutAndRedirect();
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBeNull();
      expect(store.error()).toBeNull();
      expect(authServiceMock.logoutAndRedirect).toHaveBeenCalledTimes(1);
      expect(tokenStorageServiceMock.clearTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('rxMethod', () => {
    let apiAuthResponse: AuthResponseDto;

    beforeEach(() => {
      apiAuthResponse = { accessToken: 'api-access-token', refreshToken: 'api-refresh-token' };
    });

    describe('registerNewUser', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        authServiceMock.registerNewUser.mockReturnValue(of(apiAuthResponse).pipe(delay(10)));

        store.registerNewUser({ registerDto: mocks.registerDto });

        expect(store.isLoading()).toBe(true);
        expect(authServiceMock.registerNewUser).toHaveBeenCalledWith(mocks.registerDto);

        jest.advanceTimersByTime(20);

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBe(apiAuthResponse.accessToken);
        jest.useRealTimers();
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({
          error: mocks.validationErrorContent,
        });

        errorManagementServiceMock.getValidationError.mockReturnValue(mocks.validationErrorContent);

        authServiceMock.registerNewUser.mockReturnValue(throwError(() => mockError));

        store.registerNewUser({ registerDto: mocks.registerDto });

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(errorManagementServiceMock.getValidationError).toHaveBeenCalledWith(mockError);
        expect(store.error()).toStrictEqual(mocks.validationErrorContent);
      });
    });

    describe('loginUser', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        authServiceMock.loginUser.mockReturnValue(of(apiAuthResponse).pipe(delay(10)));

        store.loginUser({ loginDto: mocks.loginDto });

        expect(store.isLoading()).toBe(true);
        expect(authServiceMock.loginUser).toHaveBeenCalledWith(mocks.loginDto);

        jest.advanceTimersByTime(20);

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBe(apiAuthResponse.accessToken);
        jest.useRealTimers();
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({
          error: mocks.validationErrorContent,
        });

        errorManagementServiceMock.getValidationError.mockReturnValue(mocks.validationErrorContent);

        authServiceMock.loginUser.mockReturnValue(throwError(() => mockError));

        store.loginUser({ loginDto: mocks.loginDto });

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(errorManagementServiceMock.getValidationError).toHaveBeenCalledWith(mockError);
        expect(store.error()).toStrictEqual(mocks.validationErrorContent);
      });
    });

    describe('refreshAccessToken', () => {
      it('should patch state on success correctly', () => {
        jest.useFakeTimers();
        authServiceMock.refreshAccessToken.mockReturnValue(of(apiAuthResponse).pipe(delay(10)));

        store.refreshAccessToken();

        expect(store.isLoading()).toBe(true);
        expect(authServiceMock.refreshAccessToken).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(20);

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBe(apiAuthResponse.accessToken);
        jest.useRealTimers();
      });

      it('should patch state on error correctly', fakeAsync(() => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });
        errorManagementServiceMock.getValidationError.mockReturnValue(null);

        authServiceMock.refreshAccessToken.mockReturnValue(throwError(() => mockError));

        store.refreshAccessToken();

        tick();
        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(errorManagementServiceMock.getValidationError).toHaveBeenCalledWith(mockError);
        expect(store.error()).toBe(null);
        expect(tokenStorageServiceMock.clearTokens).toHaveBeenCalledTimes(1);
        expect(authServiceMock.logoutAndRedirect).toHaveBeenCalledTimes(1);
      }));
    });
  });
});
