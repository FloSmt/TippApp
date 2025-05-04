import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import {User} from "../entities/user.entity";

import {Tip} from "../entities/tip.entity";
import {registerAs} from "@nestjs/config";
import * as process from "node:process";
import {Tipgroup} from "../entities/tipgroup.entity";
import {TipgroupUser} from "../entities/tipgroupUser.entity";
import {Match} from "../entities/match.entity";
import {Matchday} from "../entities/matchday.entity";
import {TipSeason} from "../entities/tipSeason.entity";

export default registerAs("dbconfig.dev", ():MysqlConnectionOptions =>  ({
  type: "mysql",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    User,
    Tipgroup,
    TipgroupUser,
    Match,
    Matchday,
    TipSeason,
    Tip,
  ],
  synchronize: true
}));
