import { Test, TestingModule } from '@nestjs/testing';
import { TipSeasonService } from './tip-season.service';

describe('TipSeasonService', () => {
  let service: TipSeasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipSeasonService],
    }).compile();

    service = module.get<TipSeasonService>(TipSeasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
