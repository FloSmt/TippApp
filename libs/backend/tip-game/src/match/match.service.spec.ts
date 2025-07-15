import { Test, TestingModule } from '@nestjs/testing';
import { CreateMatchDto } from '@tippapp/shared/data-access';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchService],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a Match Entity', () => {
    const createMatchDtoMock = {
      api_matchId: 2,
    } as CreateMatchDto;

    const response = service.createMatch(createMatchDtoMock);

    expect(response.api_matchId).toBe(createMatchDtoMock.api_matchId);
  });
});
