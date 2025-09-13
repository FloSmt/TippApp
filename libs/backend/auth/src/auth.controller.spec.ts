import {createMock, DeepMocked} from '@golevelup/ts-jest';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '@tippapp/backend/user';
import {AuthResponseDto, LoginDto, RegisterDto,} from '@tippapp/shared/data-access';
import {Response} from "express";
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
        refreshToken: 'refreshToken',
      };
    },

    get loginData(): LoginDto {
      return {email: 'test@email.de', password: 'password'};
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

  it('should return auth-response on login', async () => {
    authService.login.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.login(mocks.loginData);

    expect(result).toEqual(mocks.authResponse);
  });

  it('should return auth-response on register', async () => {
    authService.register.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.register(mocks.registerData);

    expect(result).toEqual(mocks.authResponse);
  });

  it('should return auth-response on Token refresh', async () => {
    authService.refreshTokens.mockResolvedValueOnce({accessToken: 'accessToken', refreshToken: 'refreshToken'});
    const result = await authController.refresh({refreshToken: 'oldRefreshToken'});

    expect(result).toEqual(mocks.authResponse);
  });
});
