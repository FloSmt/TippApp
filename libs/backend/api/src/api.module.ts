import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApiService } from './api.service';

@Module({
  imports: [HttpModule, ConfigModule],
  exports: [ApiService],
  providers: [ApiService],
})
export class ApiModule {}
