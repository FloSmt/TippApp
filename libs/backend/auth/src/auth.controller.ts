import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthResponseDto, ErrorCodes, LoginDto, RegisterDto } from '@tippapp/shared/data-access';
import { ErrorManagerService, ErrorResponse } from '@tippapp/backend/error-handling';
import { DefaultResponse } from '@tippapp/backend/shared';
import { AuthService } from './auth.service';
import { Public } from './guards/jwt-auth.guard';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService, private errorManager: ErrorManagerService) {}

  @Post('login')
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'returns accessToken, refreshToken and userId for User login',
    responseType: AuthResponseDto,
  })
  @ErrorResponse(HttpStatus.UNAUTHORIZED, ErrorCodes.Auth.INVALID_CREDENTIALS)
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.Auth.USER_NOT_FOUND)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @DefaultResponse({
    httpStatus: HttpStatus.CREATED,
    endpointSummary: 'creates a User if email not exists',
    responseType: AuthResponseDto,
  })
  @ErrorResponse(HttpStatus.CONFLICT, ErrorCodes.Auth.EMAIL_ALREADY_EXISTS)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('refresh')
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'generates a new accessToken with existing refreshToken',
    responseType: AuthResponseDto,
  })
  @ErrorResponse(HttpStatus.UNAUTHORIZED, ErrorCodes.Auth.INVALID_REFRESH_TOKEN)
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body || !body.refreshToken) {
      throw this.errorManager.createError(ErrorCodes.Auth.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    return await this.authService.refreshTokens(body.refreshToken);
  }
}
