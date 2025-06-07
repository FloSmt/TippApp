import {ConflictException, Injectable, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UserService} from '@tippapp/backend/user';
import {AuthResponseDto, LoginDto, RegisterDto,} from '@tippapp/shared/data-access';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordMatch = await this.comparePasswords(
      loginDto.password,
      user.password!
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const newTokens = this.generateTokens({ sub: user.id, email: user.email });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      userId: user.id,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const userAlreadyExists =
      (await this.userService.findByEmail(registerDto.email)) != null;

    if (userAlreadyExists) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await this.hashPassword(registerDto.password);
    const user = await this.userService.create({
      ...registerDto,
      password: passwordHash,
    });
    const newTokens = this.generateTokens({ sub: user.id, email: user.email });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      userId: user.id,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string
  ): Promise<AuthResponseDto> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refreshToken');
    }

    const newTokens = this.generateTokens({
      username: user.username,
      id: user.id,
    });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      userId: user.id,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  generateTokens(payload: any): { accessToken: string; refreshToken: string } {
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
