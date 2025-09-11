import {Body, Controller, HttpCode, HttpStatus, Post,} from '@nestjs/common';
import {ApiErrorDto, AuthResponseDto, ErrorCodes, LoginDto, RegisterDto,} from '@tippapp/shared/data-access';
import {ApiOkResponse, ApiOperation, ApiResponse} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {Public} from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({type: AuthResponseDto})
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    type: ApiErrorDto,
    example: ErrorCodes.Auth.INVALID_CREDENTIALS,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiErrorDto,
    example: ErrorCodes.Auth.USER_NOT_FOUND,
  })
  @ApiOperation({
    summary: 'returns accessToken, refreshToken and userId for User login',
  })
  @ApiResponse({status: 200, type: AuthResponseDto})
  async login(
    @Body() loginDto: LoginDto
  ) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'creates a User if email not exists'})
  @ApiResponse({status: 201, type: AuthResponseDto})
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
    type: ApiErrorDto,
    example: ErrorCodes.Auth.EMAIL_ALREADY_EXISTS,
  })
  async register(
    @Body() registerDto: RegisterDto
  ) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'generates a new accessToken with existing refreshToken',
  })
  @ApiResponse({status: 200, type: AuthResponseDto})
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
    type: ApiErrorDto,
    example: ErrorCodes.Auth.INVALID_REFRESH_TOKEN,
  })
  async refresh(
    @Body() body: { refreshToken: string }
  ) {
    return await this.authService.refreshTokens(body.refreshToken);


  }
}
