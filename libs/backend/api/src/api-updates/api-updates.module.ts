import { Module } from '@nestjs/common';
import { ApiUpdatesController } from './api-updates.controller';
import { ApiUpdatesService } from './api-updates.service';

@Module({
  controllers: [ApiUpdatesController],
  providers: [ApiUpdatesService],
})
export class ApiUpdatesModule {}
