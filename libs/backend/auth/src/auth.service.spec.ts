import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import {
  ErrorCodes,
  LoginDto,
  RegisterDto,
  User,
} from '@tippapp/shared/data-access';
import { UserService } from '@tippapp/backend/user';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HashService } from '@tippapp/backend/shared';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: DeepMocked<UserService>;
  let errorManagerService: DeepMocked<ErrorManagerService>;
  let hashService: DeepMocked<HashService>;

  const jwtServiceMock = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mocks = {
    get loginData(): LoginDto[] {
      return [
        {
          email: 'test@gmail.com',
          password: '1234',
        },
        {
          email: 'test2@gmail.com',
          password: 'password',
        },
      ];
    },

    get registerData(): RegisterDto[] {
      return [
        {
          username: 'test',
          email: 'test@email.de',
          password: '1234',
        },
      ];
    },

    get userData(): User {
      return {
        id: 4,
        username: 'testUser',
        password: 'password',
        email: 'test2@gmail.com',
        refreshToken: 'tokenFromDB',
      };
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: ErrorManagerService,
          useValue: createMock<ErrorManagerService>(),
        },
        {
          provide: HashService,
          useValue: createMock<HashService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    errorManagerService = module.get(ErrorManagerService);
    hashService = module.get(HashService);

    jest
      .spyOn(errorManagerService, 'createError')
      .mockReturnValue(new HttpException('Error', 404));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('endpoint functionality', () => {
    beforeEach(() => {
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    describe('login', () => {
      it('should throw Error-Code AUTH.USER_NOT_FOUND if the User was not found', async () => {
        userService.findByEmail.mockResolvedValueOnce(null);

        const result = service.login(mocks.loginData[0]);

        await expect(result).rejects.toThrow(new HttpException('Error', 404));
        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.USER_NOT_FOUND,
          404
        );

        expect(userService.findByEmail).toHaveBeenCalledWith(
          mocks.loginData[0].email
        );
      });

      it('should throw an UnauthorizedException if the passwords dont match', async () => {
        jest
          .spyOn(hashService, 'comparePasswords')
          .mockResolvedValueOnce(false);

        const result = service.login(mocks.loginData[0]);

        await expect(result).rejects.toThrow(new HttpException('Error', 404));
        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.INVALID_CREDENTIALS,
          401
        );

        expect(userService.findByEmail).toHaveBeenCalledWith(
          mocks.loginData[0].email
        );
      });

      it('should return refreshToken and accessToken', async () => {
        userService.findByEmail.mockResolvedValueOnce(mocks.userData);
        jest.spyOn(hashService, 'comparePasswords').mockResolvedValueOnce(true);

        await expect(service.login(mocks.loginData[1])).resolves.toEqual({
          accessToken: 'newAccessToken',
          refreshToken: 'newRefreshToken',
        });
        expect(service.generateTokens).toHaveBeenCalled();
        expect(userService.updateRefreshToken).toHaveBeenCalledWith(
          mocks.userData.id,
          'newRefreshToken'
        );
      });
    });

    describe('register', () => {
      it('should throw an ConflictException if User already exists', async () => {
        userService.findByEmail.mockResolvedValueOnce(mocks.userData);

        const result = service.register(mocks.registerData[0]);

        await expect(result).rejects.toThrow(new HttpException('Error', 404));
        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.EMAIL_ALREADY_EXISTS,
          409
        );

        expect(userService.findByEmail).toHaveBeenCalledWith(
          mocks.registerData[0].email
        );
      });

      it('should create a new User with hashed Password', async () => {
        jest
          .spyOn(hashService, 'hashPassword')
          .mockResolvedValueOnce('hashedPassword');
        userService.findByEmail.mockResolvedValueOnce(null);
        userService.create.mockResolvedValueOnce(mocks.userData);

        await expect(service.register(mocks.registerData[0])).resolves.toEqual({
          accessToken: 'newAccessToken',
          refreshToken: 'newRefreshToken',
        });

        expect(userService.create).toHaveBeenCalledWith({
          ...mocks.registerData[0],
          password: 'hashedPassword',
        });

        expect(service.generateTokens).toHaveBeenCalled();
        expect(userService.updateRefreshToken).toHaveBeenCalledWith(
          mocks.userData.id,
          'newRefreshToken'
        );
      });
    });

    describe('refreshTokens', () => {
      let verifyTokenSpy: jest.SpyInstance;

      beforeEach(() => {
        verifyTokenSpy = jest.spyOn(service, 'verifyToken');
      });

      it('should throw an UnauthorizedException if token is could not verified', async () => {
        verifyTokenSpy.mockReturnValue(null);

        await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
          new HttpException('Error', 404)
        );

        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
          401
        );
        expect(userService.findById).not.toHaveBeenCalled();
        expect(verifyTokenSpy).toHaveBeenCalledWith('invalidToken');
      });

      it('should throw an UnauthorizedException if user was not found', async () => {
        verifyTokenSpy.mockReturnValue({ id: 22, email: 'mock@email.de' });
        userService.findById.mockResolvedValueOnce(null);

        await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
          new HttpException('Error', 404)
        );
        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
          401
        );

        expect(userService.findById).toHaveBeenCalledWith(22);
      });

      it('should throw an UnauthorizedException if refresh tokens are not the same', async () => {
        verifyTokenSpy.mockReturnValue({ id: 22, email: 'mock@email.de' });
        userService.findById.mockResolvedValueOnce({
          ...mocks.userData,
          refreshToken: 'different',
        });

        await expect(service.refreshTokens('refreshToken')).rejects.toThrow(
          new HttpException('Error', 404)
        );
        expect(errorManagerService.createError).toHaveBeenCalledWith(
          ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
          401
        );

        expect(userService.findById).toHaveBeenCalledWith(22);
      });

      it('should generate new Tokens', async () => {
        verifyTokenSpy.mockReturnValue({ id: 22, email: 'mock@email.de' });
        userService.findById.mockResolvedValueOnce(mocks.userData);

        const result = await service.refreshTokens(mocks.userData.refreshToken);

        expect(result).toEqual({
          accessToken: 'newAccessToken',
          refreshToken: 'newRefreshToken',
        });

        expect(service.generateTokens).toHaveBeenCalledWith({
          email: mocks.userData.email,
          id: mocks.userData.id,
        });
        expect(verifyTokenSpy).toHaveBeenCalledWith(
          mocks.userData.refreshToken
        );
        expect(userService.updateRefreshToken).toHaveBeenCalledWith(
          mocks.userData.id,
          'newRefreshToken'
        );
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jwtServiceMock.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      const payload = { email: 'testEmail', id: 1 };
      const tokens = service.generateTokens(payload);

      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);

      expect(tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('verifyToken', () => {
    it('should return Payload if token is correct', () => {
      const payload = { email: 'testEmail', id: 1 };
      jwtServiceMock.verify.mockReturnValue(payload);

      const tokens = service.verifyToken('token');

      expect(jwtServiceMock.verify).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.verify).toHaveBeenCalledWith('token', {
        secret: expect.anything(),
      });

      expect(tokens).toEqual(payload);
    });

    it('should return null if token is not correct', () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const tokens = service.verifyToken('token');

      expect(jwtServiceMock.verify).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.verify).toHaveBeenCalledWith('token', {
        secret: expect.anything(),
      });

      expect(tokens).toEqual(null);
    });
  });
});
