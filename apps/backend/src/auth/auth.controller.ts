import {Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {Public} from "../guards/jwt-auth.guard";
import {ApiOkResponse, ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {AuthResponseDto} from "./dto/auth-response.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOkResponse({type: AuthResponseDto})
  @ApiOperation({summary: 'returns accessToken, refreshToken and userId for User login'})
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOkResponse({type: AuthResponseDto})
  @ApiOperation({summary: 'creates a User if email not exists'})
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'generates a new accessToken with existing refreshToken'})
  @ApiParam({name: 'userId', type: 'number'})
  @ApiParam({name: 'refreshToken', type: 'string'})
  @ApiOkResponse({type: AuthResponseDto})
  async refresh(@Body() body: {userId: number; refreshToken: string}) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
