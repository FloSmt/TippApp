import { Module } from '@nestjs/common';
import { MatchdayService } from './matchday.service';
import { MatchdayController } from './matchday.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Matchday} from "../../database/entities/matchday.entity";
import {MatchModule} from "../match/match.module";

@Module({
  imports: [TypeOrmModule.forFeature([Matchday]), MatchModule],
  controllers: [MatchdayController],
  exports: [MatchdayService],
  providers: [MatchdayService],
})
export class MatchdayModule {}
