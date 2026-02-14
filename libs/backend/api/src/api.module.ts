import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { ApiService } from './api.service';
import { ApiUpdatesModule } from './api-updates/api-updates.module';

@Module({
  imports: [HttpModule, ConfigModule, ApiUpdatesModule],
  exports: [ApiService],
  providers: [ApiService, ErrorManagerService],
})
export class ApiModule {}
