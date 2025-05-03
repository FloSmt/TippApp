import { Test, TestingModule } from '@nestjs/testing';
import { TipSeasonController } from './tip-season.controller';
import { TipSeasonService } from './tip-season.service';

describe('TipSeasonController', () => {
  let controller: TipSeasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipSeasonController],
      providers: [TipSeasonService],
    }).compile();

    controller = module.get<TipSeasonController>(TipSeasonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
