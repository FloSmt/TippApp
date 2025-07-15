import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipSeason } from '@tippapp/shared/data-access';
import { TipSeasonService } from './tip-season.service';
import { TipSeasonController } from './tip-season.controller';
import { MatchdayModule } from '../matchday';

@Module({
  imports: [TypeOrmModule.forFeature([TipSeason]), MatchdayModule],
  controllers: [TipSeasonController],
  exports: [TipSeasonService],
  providers: [TipSeasonService],
})
export class TipSeasonModule {}
