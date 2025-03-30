import { Test, TestingModule } from '@nestjs/testing';
import {AuthService} from "./auth.service";
import {JwtService} from "@nestjs/jwt";
import {createMock, DeepMocked} from "@golevelup/ts-jest";
import {ConfigService} from "@nestjs/config";
import {UserService} from "../modules/user/user.service";
import {UnauthorizedException} from "@nestjs/common";
import {LoginDto} from "./dto/login.dto";
import {User} from "../database/entities/user.entity";

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: DeepMocked<JwtService>;
  let configService: DeepMocked<ConfigService>;
  let userService: DeepMocked<UserService>;

  let getLoginMock = () => {
    return {email: 'test@gmail.com', password: '1234'} as LoginDto
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
    it('should throw an Error if the User was not found', async () => {
      userService.findByEmail.mockResolvedValueOnce(null);
      await expect(service.login(getLoginMock())).rejects.toThrow(new UnauthorizedException('User not found'));
    });

    it('should throw an Error if the passwords dont match', async () => {
      userService.findByEmail.mockResolvedValueOnce();
      await expect(service.login(getLoginMock())).rejects.toThrow(new UnauthorizedException('User not found'));
    });
  })
});
