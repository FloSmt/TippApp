import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UserService} from "../modules/user/user.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {AuthResponseDto} from "./dto/auth-response.dto";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException();
    }

    if (user?.passwordHash !== loginDto.passwordHash) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') });

    await this.userService.updateRefreshToken(user.id, refreshToken)

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const userAlreadyExists = await this.userService.findByEmail(registerDto.email) != null;

    if (userAlreadyExists) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.userService.create(registerDto);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') });

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<AuthResponseDto> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('UserId not found');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refreshToken')
    }

    const payload = { username: user.username, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.userService.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}
