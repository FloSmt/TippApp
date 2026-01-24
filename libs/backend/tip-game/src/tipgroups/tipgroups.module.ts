import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Matchday, Tipgroup, TipgroupUser, TipSeason } from '@tippapp/shared/data-access';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import {
  HashService,
  MatchdayRepository,
  MatchRepository,
  SeasonRepository,
  TipgroupRepository,
  TipgroupUserRepository,
} from '@tippapp/backend/shared';
import { SeasonController, SeasonService } from './season';
import { TipgroupsController } from './tipgroups.controller';
import { TipgroupsService } from './tipgroups.service';
import { MatchdayController } from './matchday/matchday.controller';
import { MatchdayService } from './matchday/matchday.service';
import { IsTipgroupMemberGuard } from '../guards/is-tipgroup-member.guard.service';
import { TipgroupMembersService } from '../tipgroup-members/tipgroup-members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipgroup, TipSeason, Matchday, Match, TipgroupUser]),
    ApiModule,
    forwardRef(() => UserModule),
  ],
  controllers: [TipgroupsController, MatchdayController, SeasonController],
  exports: [TipgroupsService, MatchdayService, SeasonService],
  providers: [
    TipgroupsService,
    TipgroupMembersService,
    ErrorManagerService,
    HashService,
    MatchdayService,
    SeasonService,
    TipgroupRepository,
    TipgroupUserRepository,
    MatchdayRepository,
    MatchRepository,
    SeasonRepository,
    IsTipgroupMemberGuard,
  ],
})
export class TipgroupsModule {}
