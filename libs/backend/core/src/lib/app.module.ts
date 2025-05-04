import {Module} from '@nestjs/common';
import {UserModule} from "@tippapp/backend/user";
import {AuthModule} from "@tippapp/backend/auth";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import * as process from "node:process";
import * as path from "node:path";
import {HttpModule} from "@nestjs/axios";
import {ApiModule} from "@tippapp/backend/api";
import {dbConfig, dbConfigProduction} from "@tippapp/backend/database";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        process.cwd(),
        'environments',
        `.env.${process.env.NODE_ENV || 'development'}`
      ),
      isGlobal: true,
      load: [dbConfig, dbConfigProduction]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: process.env.NODE_ENV === "production"? dbConfigProduction : dbConfig,
    }),
    UserModule,
    AuthModule,
    HttpModule,
    ApiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
