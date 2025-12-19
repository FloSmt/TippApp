import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Matchday, Tipgroup, TipSeason } from '@tippapp/shared/data-access';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HashService } from '@tippapp/backend/shared';
import { TipSeasonModule } from '../tipseason';
import { TipgroupsController } from './tipgroups.controller';
import { TipgroupsService } from './tipgroups.service';
import { TipgroupController } from './tipgroup/tipgroup.controller';
import { TipgroupService } from './tipgroup/tipgroup.service';
import { QueriesService } from '../queries/queries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipgroup, TipSeason, Matchday, Match]),
    TipSeasonModule,
    ApiModule,
    forwardRef(() => UserModule),
  ],
  controllers: [TipgroupsController, TipgroupController],
  exports: [TipgroupsService, TipgroupService],
  providers: [TipgroupsService, ErrorManagerService, HashService, TipgroupService, QueriesService],
})
export class TipgroupsModule {}
