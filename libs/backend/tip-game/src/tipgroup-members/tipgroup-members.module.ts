import { Module } from '@nestjs/common';
import { TipgroupMembersService } from './tipgroup-members.service';

@Module({
  providers: [TipgroupMembersService],
})
export class TipgroupMembersModule {}
