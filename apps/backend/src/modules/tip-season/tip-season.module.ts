import { Module } from '@nestjs/common';
import { TipSeasonService } from './tip-season.service';
import { TipSeasonController } from './tip-season.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TipSeason} from "../../database/entities/tipSeason.entity";
import {MatchdayModule} from "../matchday/matchday.module";

@Module({
  imports: [TypeOrmModule.forFeature([TipSeason]), MatchdayModule],
  controllers: [TipSeasonController],
  exports: [TipSeasonService],
  providers: [TipSeasonService],
})
export class TipSeasonModule {}
