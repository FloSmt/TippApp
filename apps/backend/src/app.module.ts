import { Module } from '@nestjs/common';
import {UserModule} from "./modules/user/user.module";
import {AuthModule} from "./auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import dbConfig from "./database/config/db.config";
import {TypeOrmModule} from "@nestjs/typeorm";
import dbConfigProduction from "./database/config/db.config.production";
import * as process from "node:process";
import * as path from "node:path";
import {HttpModule} from "@nestjs/axios";

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
    HttpModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
