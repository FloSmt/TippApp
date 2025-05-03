import { Module } from '@nestjs/common';
import {ApiService} from "./api.service";
import {HttpModule} from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  exports: [ApiService],
  providers: [ApiService],
})
export class ApiModule {}
