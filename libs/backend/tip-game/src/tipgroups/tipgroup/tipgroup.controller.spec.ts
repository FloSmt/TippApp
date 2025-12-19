import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchdayResponseDto } from '@tippapp/shared/data-access';
import { TipgroupController } from './tipgroup.controller';
import { TipgroupService } from './tipgroup.service';

describe('TipgroupController', () => {
  let controller: TipgroupController;
  let tipgroupServiceMock: DeepMocked<TipgroupService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipgroupController],
      providers: [
        {
          provide: TipgroupService,
          useValue: createMock<TipgroupService>(),
        },
      ],
    }).compile();

    controller = module.get<TipgroupController>(TipgroupController);
    tipgroupServiceMock = module.get(TipgroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should response the requested matchday with all matches', async () => {
    tipgroupServiceMock.getMatchdayDetails.mockResolvedValue({
      matchdayId: 1,
      matches: [],
    } as unknown as MatchdayResponseDto);

    const params = { tipgroupId: 1, seasonId: 2024, matchdayId: 1 };
    const result = await controller.getMatchday(params);
    expect(tipgroupServiceMock.getMatchdayDetails).toHaveBeenCalledWith(1, 2024, 1);
    expect(result).toEqual({ matchdayId: 1, matches: [] });
  });
});
