import { Test, TestingModule } from '@nestjs/testing';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { createMock } from '@golevelup/ts-jest';
import { ApiService } from '@tippapp/backend/api';
import { MatchdayRepository, MatchRepository } from '@tippapp/backend/shared';
import { MatchService } from '../match/match.service';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: MatchdayRepository,
          useValue: createMock<MatchdayRepository>(),
        },
        {
          provide: MatchRepository,
          useValue: createMock<MatchRepository>(),
        },
        {
          provide: ErrorManagerService,
          useValue: createMock<ErrorManagerService>(),
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>(),
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
