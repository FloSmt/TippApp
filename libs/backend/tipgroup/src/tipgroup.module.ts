import { forwardRef, Module } from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { TipgroupController } from './tipgroup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipSeasonModule } from 'libs/backend/tipseason/src/tip-season.module';
import { Tipgroup, TipgroupUser } from '@tippapp/backend/database';
import { ApiModule } from '@tippapp/backend/api';
import { UserModule } from '@tippapp/backend/user';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipgroup, TipgroupUser]),
    TipSeasonModule,
    ApiModule,
    forwardRef(() => UserModule),
  ],
  controllers: [TipgroupController],
  exports: [TipgroupService],
  providers: [TipgroupService],
})
export class TipgroupModule {}
