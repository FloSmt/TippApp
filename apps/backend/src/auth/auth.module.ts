import {Module} from '@nestjs/common';
import { AuthService } from './auth.service';
import {UserModule} from "../modules/user/user.module";
import {AuthController} from "./auth.controller";
import {JwtModule} from "@nestjs/jwt";
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      })
    })
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
  controllers: [AuthController],
  exports: [AuthService]
})

export class AuthModule {}
