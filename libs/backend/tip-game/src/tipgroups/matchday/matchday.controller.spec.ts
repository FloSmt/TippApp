import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchdayResponseDto } from '@tippapp/shared/data-access';
import { MatchdayController } from './matchday.controller';
import { MatchdayService } from './matchday.service';

describe('MatchdayController', () => {
  let controller: MatchdayController;
  let tipgroupServiceMock: DeepMocked<MatchdayService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchdayController],
      providers: [
        {
          provide: MatchdayService,
          useValue: createMock<MatchdayService>(),
        },
      ],
    }).compile();

    controller = module.get<MatchdayController>(MatchdayController);
    tipgroupServiceMock = module.get(MatchdayService);
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
