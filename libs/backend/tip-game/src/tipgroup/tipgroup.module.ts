import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipgroup } from '@tippapp/shared/data-access';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { HashService } from '@tippapp/backend/shared';
import { TipSeasonModule } from '../tipseason';
import { TipgroupsController } from './tipgroups.controller';
import { TipgroupService } from './tipgroup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipgroup]),
    TipSeasonModule,
    ApiModule,
    forwardRef(() => UserModule),
  ],
  controllers: [TipgroupsController],
  exports: [TipgroupService],
  providers: [TipgroupService, ErrorManagerService, HashService],
})
export class TipgroupModule {}
