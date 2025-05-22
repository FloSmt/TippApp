import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import {User} from "../entities/user.entity";
import {Tipgroup} from "../entities/tipgroup.entity";
import {TipgroupUser} from "../entities/tipgroupUser.entity";
import {Match} from "../entities/match.entity";
import {Matchday} from "../entities/matchday.entity";
import {TipSeason} from "../entities/tipSeason.entity";
import {Tip} from "../entities/tip.entity";
import {registerAs} from "@nestjs/config";

export default registerAs("dbconfig.prod", ():MysqlConnectionOptions =>  ({
  type: "mysql",
  host: "localhost",
  port: 3307,
  username: "root",
  password: "root",
  database: "tippApp-DB",
  entities: [
    User,
    Tipgroup,
    TipgroupUser,
    Match,
    Matchday,
    TipSeason,
    Tip,
  ],
  synchronize: false
}));
