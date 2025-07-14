import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matchday } from '@tippapp/shared/data-access';
import { MatchdayService } from './matchday.service';
import { MatchModule } from '../match';
import { MatchdayController } from './matchday.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Matchday]), MatchModule],
  controllers: [MatchdayController],
  exports: [MatchdayService],
  providers: [MatchdayService],
})
export class MatchdayModule {}
