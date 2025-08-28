import { TestBed } from '@angular/core/testing';
import {
  ApiValidationErrorMessage,
  LoginDto,
  RegisterDto,
} from '@tippapp/shared/data-access';
import { delay, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorManagementService } from '../../error-management/error-management.service';
import { AuthService } from '../index';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let authService: AuthService;

  const mockErrorManagementService = {
    handleValidationError: jest.fn(),
  };

  const mockAuthService = {
    registerNewUser: jest.fn(),
    loginUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    logoutAndRedirect: jest.fn(),
  };

  const mocks = {
    get mockValidationErrorContent(): ApiValidationErrorMessage[] {
      return [
        {
          property: 'email',
          constraints: { isEmail: 'Email must be valid' },
        },
      ];
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ErrorManagementService,
          useValue: mockErrorManagementService,
        },
      ],
    });

    store = TestBed.inject(AuthStore);
    authService = TestBed.inject(AuthService);
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
      store.loginSuccess('mock-token');
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should set hasError to true if an Error is set', () => {
      mockErrorManagementService.handleValidationError.mockReturnValue(
        mocks.mockValidationErrorContent
      );
      store.loginFailure(new HttpErrorResponse({ error: 'test-error' }));
      expect(store.hasError()).toBe(true);
      expect(store.error()).toStrictEqual(mocks.mockValidationErrorContent);
    });
  });

  describe('Synchronous methods', () => {
    it('should patch State for registrationSuccess correctly', () => {
      const newToken = 'new-token-1';
      store.registrationSuccess(newToken);
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBe(newToken);
      expect(store.error()).toBeNull();
    });

    it('should patch State for registrationFailure correctly', () => {
      const mockError = new HttpErrorResponse({ error: 'test-error' });

      store.registrationFailure(mockError);
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBeNull();
      expect(
        mockErrorManagementService.handleValidationError
      ).toHaveBeenCalledWith(mockError);
    });

    it('should patch State for logoutAndRedirect correctly and call logoutAndRedirect in AuthService', () => {
      const loggedInToken = 'logged-in-token';
      store.loginSuccess(loggedInToken);
      expect(store.accessToken()).toBe(loggedInToken);

      store.logoutAndRedirect();
      expect(store.isLoading()).toBe(false);
      expect(store.accessToken()).toBeNull();
      expect(store.error()).toBeNull();
      expect(mockAuthService.logoutAndRedirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('rxMethod', () => {
    describe('registerNewUser', () => {
      it('should patch state on success correctly', (done) => {
        const registerDto: RegisterDto = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        };
        const apiResponse = { accessToken: 'api-access-token' };

        jest
          .spyOn(authService, 'registerNewUser')
          .mockReturnValue(of(apiResponse).pipe(delay(1)));

        store.registerNewUser({ registerDto });

        expect(store.isLoading()).toBe(true);
        expect(authService.registerNewUser).toHaveBeenCalledWith(registerDto);

        setTimeout(() => {
          expect(store.isLoading()).toBe(false);
          expect(store.accessToken()).toBe(apiResponse.accessToken);
          done();
        }, 5);
      });

      it('should patch state on error correctly', () => {
        const registerDto: RegisterDto = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        };
        const mockError = new HttpErrorResponse({
          error: mocks.mockValidationErrorContent,
        });

        mockErrorManagementService.handleValidationError.mockReturnValue(
          mocks.mockValidationErrorContent
        );

        jest
          .spyOn(authService, 'registerNewUser')
          .mockReturnValue(throwError(() => mockError));

        store.registerNewUser({ registerDto });

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(
          mockErrorManagementService.handleValidationError
        ).toHaveBeenCalledWith(mockError);
        expect(store.error()).toStrictEqual(mocks.mockValidationErrorContent);
      });
    });

    describe('loginUser', () => {
      it('should patch state on success correctly', (done) => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };
        const apiResponse = { accessToken: 'api-access-token' };

        jest
          .spyOn(authService, 'loginUser')
          .mockReturnValue(of(apiResponse).pipe(delay(1)));

        store.loginUser({ loginDto });

        expect(store.isLoading()).toBe(true);
        expect(authService.loginUser).toHaveBeenCalledWith(loginDto);

        setTimeout(() => {
          expect(store.isLoading()).toBe(false);
          expect(store.accessToken()).toBe(apiResponse.accessToken);
          done();
        }, 5);
      });

      it('should patch state on error correctly', () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };
        const mockError = new HttpErrorResponse({
          error: mocks.mockValidationErrorContent,
        });

        mockErrorManagementService.handleValidationError.mockReturnValue(
          mocks.mockValidationErrorContent
        );

        jest
          .spyOn(authService, 'loginUser')
          .mockReturnValue(throwError(() => mockError));

        store.loginUser({ loginDto });

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(
          mockErrorManagementService.handleValidationError
        ).toHaveBeenCalledWith(mockError);
        expect(store.error()).toStrictEqual(mocks.mockValidationErrorContent);
      });
    });

    describe('refreshAccessToken', () => {
      it('should patch state on success correctly', (done) => {
        const apiResponse = { accessToken: 'refreshed-token' };
        jest
          .spyOn(authService, 'refreshAccessToken')
          .mockReturnValue(of(apiResponse).pipe(delay(1)));

        store.refreshAccessToken();

        expect(store.isLoading()).toBe(true);
        expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

        setTimeout(() => {
          expect(store.isLoading()).toBe(false);
          expect(store.accessToken()).toBe(apiResponse.accessToken);
          done();
        }, 5);
      });

      it('should patch state on error correctly', () => {
        const mockError = new HttpErrorResponse({ error: 'test-error' });

        mockErrorManagementService.handleValidationError.mockReturnValue(null);

        jest
          .spyOn(authService, 'refreshAccessToken')
          .mockReturnValue(throwError(() => mockError));

        store.refreshAccessToken();

        expect(store.isLoading()).toBe(false);
        expect(store.accessToken()).toBeNull();
        expect(
          mockErrorManagementService.handleValidationError
        ).toHaveBeenCalledWith(mockError);
        expect(store.error()).toBe(null);
        expect(mockAuthService.logoutAndRedirect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
