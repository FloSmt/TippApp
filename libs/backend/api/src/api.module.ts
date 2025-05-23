import {Module} from '@nestjs/common';
import {ApiService} from "./api.service";
import {HttpModule} from "@nestjs/axios";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  exports: [ApiService],
  providers: [ApiService],
})
export class ApiModule {
}
