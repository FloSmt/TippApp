import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '@tippapp/shared/data-access';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiOperation({
    summary: 'returns accessToken, refreshToken and userId for User login',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'creates a User if email not exists' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'generates a new accessToken with existing refreshToken',
  })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiParam({ name: 'refreshToken', type: 'string' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() body: { userId: number; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
