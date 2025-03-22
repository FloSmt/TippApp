import { DataSource } from 'typeorm';
import {Match} from "./entities/match.entity";
import {Matchday} from "./entities/matchday.entity";
import {Tip} from "./entities/tip.entity";
import {Tipgroup} from "./entities/tipgroup.entity";
import {TipgroupUser} from "./entities/tipgroupUser.entity";
import {TipSeason} from "./entities/tipSeason.entity";
import {User} from "./entities/user.entity";

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
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
      });

      return dataSource.initialize();
    },
  },
];
