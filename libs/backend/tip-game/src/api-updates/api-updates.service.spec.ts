import { Test, TestingModule } from '@nestjs/testing';
import { ApiUpdatesService } from './api-updates.service';

describe('ApiUpdatesService', () => {
  let service: ApiUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiUpdatesService],
    }).compile();

    service = module.get<ApiUpdatesService>(ApiUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
