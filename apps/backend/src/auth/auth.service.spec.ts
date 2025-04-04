import { Test, TestingModule } from '@nestjs/testing';
import {AuthService} from "./auth.service";
import {JwtService} from "@nestjs/jwt";
import {createMock, DeepMocked} from "@golevelup/ts-jest";
import {ConfigService} from "@nestjs/config";
import {UserService} from "../modules/user/user.service";
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {LoginDto} from "./dto/login.dto";
import { User } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: DeepMocked<JwtService>;
  let configService: DeepMocked<ConfigService>;
  let userService: DeepMocked<UserService>;

  const mocks = {
    get loginData(): LoginDto[] {
      return [{
        email: 'test@gmail.com',
        password: '1234'
      },
        {
          email: 'test2@gmail.com',
          password: 'password'
        }]
    },

    get registerData(): RegisterDto[] {
      return [{
        username: 'test',
        email: 'test@email.de',
        password: '1234'
      }]
    },

    get userData(): User {
      return {
        id: 4,
        username: 'testUser',
        password: 'password',
        email: 'test2@gmail.com',
        refreshToken: 'tokenFromDB'
      }
    }
  }

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
          useValue: createMock<ConfigService>()
        },
        {
          provide: UserService,
          useValue: createMock<UserService>()
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    userService = module.get(UserService);
  });

  describe('login', () => {
    it('should throw an UnauthorizedException if the User was not found', async () => {
      userService.findByEmail.mockResolvedValueOnce(null);
      await expect(service.login(mocks.loginData[0])).rejects.toThrow(new UnauthorizedException('User not found'));

      expect(userService.findByEmail).toHaveBeenCalledWith(mocks.loginData[0].email);
    });

    it('should throw an UnauthorizedException if the passwords dont match', async () => {
      jest.spyOn(service, 'comparePasswords').mockResolvedValueOnce(false);

      await expect(service.login(mocks.loginData[0]))
        .rejects.toThrow(new UnauthorizedException('Invalid credentials'));

      expect(userService.findByEmail).toHaveBeenCalledWith(mocks.loginData[0].email);
    });

    it('should return id, refreshToken and accessToken', async () => {
      userService.findByEmail.mockResolvedValueOnce(mocks.userData);
      jest.spyOn(service, 'comparePasswords').mockResolvedValueOnce(true);
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      await expect(service.login(mocks.loginData[1])).resolves.toEqual({
        userId: mocks.userData.id,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(service.generateTokens).toHaveBeenCalled();
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(mocks.userData.id, 'refreshToken');
    });
  })

  describe('register', () => {
    it('should throw an ConflictException if User already exists', async () => {
      userService.findByEmail.mockResolvedValueOnce(mocks.userData);

      await expect(service.register(mocks.registerData[0])).rejects.toThrow(new ConflictException('Email already exists'))
    });

    it('should create a new User with hashed Password', async () => {
      jest.spyOn(service, 'hashPassword').mockResolvedValueOnce('hashedPassword');
      userService.findByEmail.mockResolvedValueOnce(null);
      userService.create.mockResolvedValueOnce(mocks.userData);
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      await expect(service.register(mocks.registerData[0])).resolves.toEqual({
        userId: mocks.userData.id,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      })
      expect(userService.create).toHaveBeenCalledWith({...mocks.registerData[0], password: 'hashedPassword'});
      expect(service.generateTokens).toHaveBeenCalled();
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(mocks.userData.id, 'refreshToken');
    });
  })

  describe('refreshTokens', () => {
    it('should throw a NotFoundException if the User was not found', async () => {
      userService.findById.mockResolvedValueOnce(null);
      await expect(service.refreshTokens(1, 'token')).rejects.toThrow(new NotFoundException('UserId not found'));
      expect(userService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an UnauthorizedException if refreshToken is not equal', async () => {
      userService.findById.mockResolvedValueOnce(mocks.userData);
      await expect(service.refreshTokens(1, 'invalidToken')).rejects.toThrow(new UnauthorizedException('Invalid refreshToken'));
      expect(userService.findById).toHaveBeenCalledWith(1);
    });

    it('should generate new Tokens', async () => {
      userService.findById.mockResolvedValueOnce(mocks.userData);
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      await expect(service.refreshTokens(1, mocks.userData.refreshToken)).resolves.toEqual({
        userId: mocks.userData.id,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      expect(service.generateTokens).toHaveBeenCalled();
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(mocks.userData.id, 'refreshToken');
    });
  })
});
