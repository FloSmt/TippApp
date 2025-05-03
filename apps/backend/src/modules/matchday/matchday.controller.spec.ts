import { Test, TestingModule } from '@nestjs/testing';
import { MatchdayController } from './matchday.controller';
import { MatchdayService } from './matchday.service';

describe('MatchdayController', () => {
  let controller: MatchdayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchdayController],
      providers: [MatchdayService],
    }).compile();

    controller = module.get<MatchdayController>(MatchdayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
