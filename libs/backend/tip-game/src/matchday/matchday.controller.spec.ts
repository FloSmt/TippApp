import {Test, TestingModule} from '@nestjs/testing';
import {MatchdayController} from './matchday.controller';

describe('MatchdayController', () => {
  let controller: MatchdayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchdayController],
      providers: [],
    }).compile();

    controller = module.get<MatchdayController>(MatchdayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
