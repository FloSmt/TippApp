import { Module } from '@nestjs/common';
import { MatchdayService } from './matchday.service';
import { MatchdayController } from './matchday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchModule } from '../match/match.module';
import { Matchday } from '@tippapp/backend/database';

@Module({
  imports: [TypeOrmModule.forFeature([Matchday]), MatchModule],
  controllers: [MatchdayController],
  exports: [MatchdayService],
  providers: [MatchdayService],
})
export class MatchdayModule {}
