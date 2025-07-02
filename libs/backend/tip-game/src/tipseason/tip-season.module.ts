import {Module} from '@nestjs/common';
import {TipSeasonService} from './tip-season.service';
import {TipSeasonController} from './tip-season.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MatchdayModule} from '../matchday';
import {TipSeason} from '@tippapp/backend/database';

@Module({
  imports: [TypeOrmModule.forFeature([TipSeason]), MatchdayModule],
  controllers: [TipSeasonController],
  exports: [TipSeasonService],
  providers: [TipSeasonService],
})
export class TipSeasonModule {}
