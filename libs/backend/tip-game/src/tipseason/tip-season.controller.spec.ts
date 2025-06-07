import {Test, TestingModule} from '@nestjs/testing';
import {TipSeasonController} from './tip-season.controller';

describe('TipSeasonController', () => {
  let controller: TipSeasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipSeasonController],
      providers: [],
    }).compile();

    controller = module.get<TipSeasonController>(TipSeasonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
