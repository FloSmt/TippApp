import {Test, TestingModule} from '@nestjs/testing';
import {JwtService} from '@nestjs/jwt';
import {createMock, DeepMocked} from '@golevelup/ts-jest';
import {ConfigService} from '@nestjs/config';
import {ConflictException, UnauthorizedException} from '@nestjs/common';
import {LoginDto, RegisterDto, User} from '@tippapp/shared/data-access';
import {UserService} from '@tippapp/backend/user';
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: DeepMocked<UserService>;

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

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);

    jest.spyOn(service, 'generateTokens').mockReturnValue({
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    });
  });

  describe('login', () => {
    it('should throw an UnauthorizedException if the User was not found', async () => {
      userService.findByEmail.mockResolvedValueOnce(null);
      await expect(service.login(mocks.loginData[0])).rejects.toThrow(
        new UnauthorizedException('User not found')
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(
        mocks.loginData[0].email
      );
    });

    it('should throw an UnauthorizedException if the passwords dont match', async () => {
      jest.spyOn(service, 'comparePasswords').mockResolvedValueOnce(false);

      await expect(service.login(mocks.loginData[0])).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(
        mocks.loginData[0].email
      );
    });

    it('should return refreshToken and accessToken', async () => {
      userService.findByEmail.mockResolvedValueOnce(mocks.userData);
      jest.spyOn(service, 'comparePasswords').mockResolvedValueOnce(true);

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

      await expect(service.register(mocks.registerData[0])).rejects.toThrow(
        new ConflictException('Email already exists')
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(
        mocks.registerData[0].email
      );
    });

    it('should create a new User with hashed Password', async () => {
      jest
        .spyOn(service, 'hashPassword')
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
    it('should throw an UnauthorizedException if refreshToken is not equal', async () => {
      userService.findByRefreshToken.mockResolvedValueOnce(null);
      await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
        new UnauthorizedException('Invalid refreshToken')
      );
      expect(userService.findByRefreshToken).toHaveBeenCalledWith('invalidToken');
    });

    it('should generate new Tokens', async () => {
      userService.findByRefreshToken.mockResolvedValueOnce(mocks.userData);

      await expect(
        service.refreshTokens(mocks.userData.refreshToken)
      ).resolves.toEqual({
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
});
