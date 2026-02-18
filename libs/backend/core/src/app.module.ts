import * as process from 'node:process';
import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { UserModule } from '@tippapp/backend/user';
import { AuthModule } from '@tippapp/backend/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from '@tippapp/backend/api';
import { dbConfigDev, dbConfigProduction, dbConfigTest } from '@tippapp/backend/database';
import { HttpModule } from '@nestjs/axios';
import { ApiUpdatesModule, TipgroupsModule } from '@tippapp/backend/tip-game';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), 'environments', `.env.${process.env.NODE_ENV.trim() || 'development'}`),
      isGlobal: true,
      load: [dbConfigDev, dbConfigTest, dbConfigProduction],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:
        process.env.NODE_ENV.trim() === 'production'
          ? dbConfigProduction
          : process.env.NODE_ENV.trim() === 'test'
          ? dbConfigTest
          : dbConfigDev,
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    HttpModule,
    TipgroupsModule,
    ApiModule,
    ApiUpdatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
