import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiUpdatesService } from './api-updates.service';

@Controller('api-updates')
export class ApiUpdatesController {
  constructor(protected readonly apiUpdateService: ApiUpdatesService) {}

  @MessagePattern('openligadb/#')
  async handleApiUpdate(@Payload() payload: any) {
    this.apiUpdateService.handleApiUpdate(payload);
  }
}
