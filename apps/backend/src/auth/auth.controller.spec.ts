import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../modules/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: DeepMocked<AuthService>;
  let jwtService: DeepMocked<JwtService>;
  let configService: DeepMocked<ConfigService>;

  const mocks = {
    get authResponse(): AuthResponseDto {
      return {userId: 1, accessToken: 'accessToken', refreshToken: 'refreshToken'};
    },

    get loginData(): LoginDto {
      return {email: 'test@email.de', password: 'password'}
    },

    get registerData(): RegisterDto {
      return { username: 'username', email: 'test@email.de', password: 'password'}
    },

    get refreshData() {
      return { userId: 1, refreshToken: 'refreshToken'}
    }
  }

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
          useValue: createMock<ConfigService>()
        },
        {
          provide: UserService,
          useValue: createMock<UserService>()
        }
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should return auth-response on login', async () => {
    authService.login.mockResolvedValueOnce(mocks.authResponse);
    const result = await authController.login(mocks.loginData);

    expect(authService.login).toHaveBeenCalledWith(mocks.loginData);
    expect(result).toEqual(mocks.authResponse);
  });

  it('should return auth-response on register', async () => {
    authService.register.mockResolvedValueOnce(mocks.authResponse);
    const result = await authController.register(mocks.registerData);

    expect(authService.register).toHaveBeenCalledWith(mocks.registerData);
    expect(result).toEqual(mocks.authResponse);
  });

  it('should return auth-response on refresh', async () => {
    authService.refreshTokens.mockResolvedValueOnce(mocks.authResponse);
    const result = await authController.refresh(mocks.refreshData);

    expect(authService.refreshTokens).toHaveBeenCalledWith(mocks.refreshData.userId, mocks.refreshData.refreshToken);
    expect(result).toEqual(mocks.authResponse);
  });
});
