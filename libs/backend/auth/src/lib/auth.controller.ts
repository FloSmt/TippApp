import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from "../../../../shared/data-access/src/lib/dtos/auth/login.dto";
import {RegisterDto} from "../../../../shared/data-access/src/lib/dtos/auth/register.dto";
import {Public} from "./guards/jwt-auth.guard";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'returns accessToken, refreshToken and userId for User login'})
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'creates a User if email not exists'})
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'generates a new accessToken with existing refreshToken'})
  @ApiParam({name: 'userId', type: 'number'})
  @ApiParam({name: 'refreshToken', type: 'string'})
  @ApiResponse({status: 200})
  async refresh(@Body() body: {userId: number; refreshToken: string}) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
