import { Module } from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { TipgroupController } from './tipgroup.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Tipgroup} from "../../database/entities/tipgroup.entity";
import {TipSeasonModule} from "../tip-season/tip-season.module";
import {ApiModule} from "../../api/api.module";
import {UserModule} from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Tipgroup]), TipSeasonModule, ApiModule, UserModule],
  controllers: [TipgroupController],
  exports: [TipgroupService],
  providers: [TipgroupService],
})
export class TipgroupModule {}
