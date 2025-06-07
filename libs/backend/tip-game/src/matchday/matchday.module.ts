import {Module} from '@nestjs/common';
import {MatchdayService} from './matchday.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MatchModule} from '../match';
import {Matchday} from '@tippapp/backend/database';
import {MatchdayController} from "./matchday.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Matchday]), MatchModule],
  controllers: [MatchdayController],
  exports: [MatchdayService],
  providers: [MatchdayService],
})
export class MatchdayModule {}
