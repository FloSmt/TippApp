import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipgroup } from '@tippapp/shared/data-access';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HashService } from '@tippapp/backend/shared';
import { TipSeasonModule } from '../tipseason';
import { TipgroupsController } from './tipgroups.controller';
import { TipgroupsService } from './tipgroups.service';
import { TipgroupController } from './tipgroup/tipgroup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tipgroup]), TipSeasonModule, ApiModule, forwardRef(() => UserModule)],
  controllers: [TipgroupsController, TipgroupController],
  exports: [TipgroupsService],
  providers: [TipgroupsService, ErrorManagerService, HashService],
})
export class TipgroupsModule {}
