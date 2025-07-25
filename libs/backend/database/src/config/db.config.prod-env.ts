import * as process from 'node:process';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { registerAs } from '@nestjs/config';
import {
  Match,
  Matchday,
  Tip,
  Tipgroup,
  TipgroupUser,
  TipSeason,
  User,
} from '@tippapp/shared/data-access';

export default registerAs(
  'dbconfig.prod',
  (): MysqlConnectionOptions => ({
    type: 'mysql',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: +(process.env['DB_PORT'] ?? 3307),
    username: process.env['DB_USER'],
    password: process.env['DB_PASS'],
    database: process.env['DB_NAME'],
    entities: [User, Tipgroup, TipgroupUser, Match, Matchday, TipSeason, Tip],
    synchronize: false,
  })
);
