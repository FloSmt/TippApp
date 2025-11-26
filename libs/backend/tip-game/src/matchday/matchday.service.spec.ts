import { Test, TestingModule } from '@nestjs/testing';
import { MatchdayService } from './matchday.service';

describe('MatchdayService', () => {
  let service: MatchdayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchdayService],
    }).compile();

    service = module.get<MatchdayService>(MatchdayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
