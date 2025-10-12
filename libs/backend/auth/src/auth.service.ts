import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@tippapp/backend/user';
import { ErrorCodes, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { comparePasswords, hashPassword } from '@tippapp/backend/shared';

export interface JwtPayload {
  email: string;
  id: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly errorManager: ErrorManagerService
  ) {}

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw this.errorManager.createError(
        ErrorCodes.Auth.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const isPasswordMatch = await comparePasswords(
      loginDto.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw this.errorManager.createError(
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
      throw this.errorManager.createError(
        ErrorCodes.Auth.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT
      );
    }
    const passwordHash = await hashPassword(registerDto.password);
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
    const decodedToken: { email: string; id: number } | null =
      this.verifyToken(refreshToken);

    if (
      !decodedToken ||
      typeof decodedToken === 'string' ||
      !('id' in decodedToken)
    ) {
      throw this.errorManager.createError(
        ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }

    const user = await this.userService.findById(decodedToken.id);

    if (!user || !refreshToken || user.refreshToken !== refreshToken) {
      throw this.errorManager.createError(
        ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }

    const newTokens = this.generateTokens({
      email: user.email,
      id: user.id,
    });
    await this.userService.updateRefreshToken(user.id, newTokens.refreshToken);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  generateTokens(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const newAccessToken = this.jwtService.sign(
      { ...payload, refreshId: uuidv4() },
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }
    );
    const newRefreshToken = this.jwtService.sign(
      { ...payload, refreshId: uuidv4() },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      console.log('Token verification failed:', error);
      return null;
    }
  }
}
