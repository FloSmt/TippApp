import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipgroup } from '@tippapp/shared/data-access';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';
import { TipSeasonModule } from '../tipseason';
import { TipgroupController } from './tipgroup.controller';
import { TipgroupService } from './tipgroup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipgroup]),
    TipSeasonModule,
    ApiModule,
    forwardRef(() => UserModule),
  ],
  controllers: [TipgroupController],
  exports: [TipgroupService],
  providers: [TipgroupService],
})
export class TipgroupModule {}
