import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@tippapp/backend/user';
import { ErrorCodes, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ErrorManagerService } from '@tippapp/backend/error-handling';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private errorManager: ErrorManagerService
  ) {}

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      this.errorManager.createError(
        ErrorCodes.Auth.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const isPasswordMatch = await this.comparePasswords(
      loginDto.password,
      user.password
    );
    if (!isPasswordMatch) {
      this.errorManager.createError(
        ErrorCodes.Auth.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      );
    }

    const newTokens = this.generateTokens({ id: user.id, email: user.email });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  async register(
    registerDto: RegisterDto
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const userAlreadyExists =
      (await this.userService.findByEmail(registerDto.email)) != null;

    if (userAlreadyExists) {
      this.errorManager.createError(
        ErrorCodes.Auth.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT
      );
    }
    const passwordHash = await this.hashPassword(registerDto.password);
    const user = await this.userService.create({
      ...registerDto,
      password: passwordHash,
    });
    const newTokens = this.generateTokens({ id: user.id, email: user.email });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByRefreshToken(refreshToken);

    if (!user || !refreshToken) {
      this.errorManager.createError(
        ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }

    const newTokens = this.generateTokens({
      username: user.username,
      id: user.id,
    });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
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
