import { forwardRef, Module } from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { TipgroupController } from './tipgroup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipSeasonModule } from '../tipseason';
import { Tipgroup } from '@tippapp/backend/database';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';

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
