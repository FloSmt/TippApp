import { Test, TestingModule } from '@nestjs/testing';
import { TipgroupService } from './tipgroup.service';

describe('TipgroupService', () => {
  let service: TipgroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipgroupService],
    }).compile();

    service = module.get<TipgroupService>(TipgroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
