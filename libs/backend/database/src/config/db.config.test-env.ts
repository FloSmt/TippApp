import { registerAs } from '@nestjs/config';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
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
  'dbconfig.test',
  (): SqliteConnectionOptions => ({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, Tipgroup, TipgroupUser, Match, Matchday, TipSeason, Tip],
    synchronize: true,
    logging: false,
  })
);
