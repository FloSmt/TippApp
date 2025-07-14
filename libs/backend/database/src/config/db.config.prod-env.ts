import * as process from 'node:process';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { registerAs } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Tipgroup } from '../entities/tipgroup.entity';
import { TipgroupUser } from '../entities/tipgroupUser.entity';
import { Match } from '../entities/match.entity';
import { Matchday } from '../entities/matchday.entity';
import { TipSeason } from '../entities/tipSeason.entity';
import { Tip } from '../entities/tip.entity';

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
