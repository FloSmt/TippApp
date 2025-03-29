import { Module } from '@nestjs/common';
import {UserModule} from "./modules/user/user.module";
import {AuthModule} from "./auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Match} from "./database/entities/match.entity";
import {Matchday} from "./database/entities/matchday.entity";
import {Tip} from "./database/entities/tip.entity";
import {Tipgroup} from "./database/entities/tipgroup.entity";
import {TipgroupUser} from "./database/entities/tipgroupUser.entity";
import {TipSeason} from "./database/entities/tipSeason.entity";
import {User} from "./database/entities/user.entity";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'root',
      database: 'tippApp-DB',
      entities: [
        // __dirname + '/../**/*.entity{.ts,.js}',
        Match,
        Matchday,
        Tip,
        Tipgroup,
        TipgroupUser,
        TipSeason,
        User
      ],
      synchronize: true,
    }),
    UserModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
