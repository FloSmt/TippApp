import {createMock, DeepMocked} from '@golevelup/ts-jest';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '@tippapp/backend/user';
import {AuthResponseDto, LoginDto, RegisterDto,} from '@tippapp/shared/data-access';
import {Request, Response} from "express";
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: DeepMocked<AuthService>;

  const responseMock = {
    status: jest.fn(),
    send: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response;

  const mocks = {
    get authResponse(): AuthResponseDto {
      return {
        accessToken: 'accessToken',
      };
    },

    get loginData(): LoginDto {
      return { email: 'test@email.de', password: 'password' };
    },

    get registerData(): RegisterDto {
      return {
        username: 'username',
        email: 'test@email.de',
        password: 'password',
      };
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('should return auth-response and set Cookie on login', async () => {
    jest.spyOn(authController, 'setRefreshTokenCookie');

    authService.login.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.login(mocks.loginData, responseMock);

    expect(result).toEqual(mocks.authResponse);
    expect(authController.setRefreshTokenCookie).toHaveBeenCalledWith(responseMock, 'refreshToken');
  });

  it('should return auth-response and set Cookie on register', async () => {
    jest.spyOn(authController, 'setRefreshTokenCookie');

    authService.register.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.register(mocks.registerData, responseMock);

    expect(result).toEqual(mocks.authResponse);
    expect(authController.setRefreshTokenCookie).toHaveBeenCalledWith(responseMock, 'refreshToken');
  });

  it('should return auth-response and set Cookie on Token refresh', async () => {
    const requestMock = {
      headers: jest.fn(),
      cookies: {refreshToken: 'oldRefreshToken'}
    } as unknown as Request;

    jest.spyOn(authController, 'setRefreshTokenCookie');

    authService.refreshTokens.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.refresh(requestMock, responseMock);

    expect(result).toEqual(mocks.authResponse);
    expect(authController.setRefreshTokenCookie).toHaveBeenCalledWith(responseMock, 'refreshToken');
  });

  it('should set a Cookie with refreshToken', () => {
    authController.setRefreshTokenCookie(responseMock, 'refreshToken');
    expect(responseMock.cookie).toHaveBeenCalledWith('refreshToken', 'refreshToken', expect.objectContaining({
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
    }));
  });
});
