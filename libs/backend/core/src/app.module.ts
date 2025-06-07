import {Module} from '@nestjs/common';
import {UserModule} from '@tippapp/backend/user';
import {AuthModule} from '@tippapp/backend/auth';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import * as process from 'node:process';
import * as path from 'node:path';
import {ApiModule} from '@tippapp/backend/api';
import {dbConfig, dbConfigProduction} from '@tippapp/backend/database';
import {HttpModule} from '@nestjs/axios';
import {TipgroupModule} from '@tippapp/backend/tip-game';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        process.cwd(),
        'environments',
        `.env.${process.env.NODE_ENV.trim() || 'development'}`
      ),
      isGlobal: true,
      load: [dbConfig, dbConfigProduction],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:
        process.env.NODE_ENV.trim() === 'production'
          ? dbConfigProduction
          : dbConfig,
    }),
    UserModule,
    AuthModule,
    HttpModule,
    TipgroupModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
