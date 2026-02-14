import { Module } from '@nestjs/common';
import { ApiUpdatesController } from './api-updates.controller';
import { ApiUpdatesService } from './api-updates.service';
import { TipgroupsModule } from '../tipgroups';

@Module({
  controllers: [ApiUpdatesController],
  providers: [ApiUpdatesService],
  imports: [TipgroupsModule],
})
export class ApiUpdatesModule {}
