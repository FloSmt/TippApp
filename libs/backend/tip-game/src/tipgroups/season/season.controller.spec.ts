import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';
import { IsTipgroupMemberGuard } from '../../guards/is-tipgroup-member.guard.service';

describe('SeasonController', () => {
  let controller: SeasonController;
  let seasonService: DeepMocked<SeasonService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonController],
      providers: [
        {
          provide: SeasonService,
          useValue: createMock<SeasonService>(),
        },
      ],
    })
      .overrideGuard(IsTipgroupMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SeasonController>(SeasonController);
    seasonService = module.get(SeasonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should response all matchdays', async () => {
    seasonService.getAllMatchdays.mockResolvedValue([
      { matchdayId: 1, matches: [] },
      { matchdayId: 2, matches: [] },
    ] as unknown as MatchdayOverviewResponseDto[]);

    const params = { tipgroupId: 1, seasonId: 1 };
    const result = await controller.getAllMatchdays(params);
    expect(seasonService.getAllMatchdays).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual([
      { matchdayId: 1, matches: [] },
      { matchdayId: 2, matches: [] },
    ]);
  });
});
