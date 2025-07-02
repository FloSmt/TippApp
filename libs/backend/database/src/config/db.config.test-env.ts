import {User} from '../entities/user.entity';
import {Tip} from '../entities/tip.entity';
import {registerAs} from '@nestjs/config';
import {Tipgroup} from "../entities/tipgroup.entity";
import {TipgroupUser} from "../entities/tipgroupUser.entity";
import {Match} from "../entities/match.entity";
import {Matchday} from "../entities/matchday.entity";
import {TipSeason} from "../entities/tipSeason.entity";
import {SqliteConnectionOptions} from "typeorm/driver/sqlite/SqliteConnectionOptions";

export default registerAs(
  'dbconfig.test',
  (): SqliteConnectionOptions => ({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, Tipgroup, TipgroupUser, Match, Matchday, TipSeason, Tip],
    synchronize: true,
    logging: false
  })
);
