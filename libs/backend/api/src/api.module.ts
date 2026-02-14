import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { ApiService } from './api.service';

@Module({
  imports: [HttpModule, ConfigModule],
  exports: [ApiService],
  providers: [ApiService, ErrorManagerService],
})
export class ApiModule {}
