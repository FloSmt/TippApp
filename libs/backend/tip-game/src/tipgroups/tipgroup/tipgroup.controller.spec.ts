import { Test, TestingModule } from '@nestjs/testing';
import { TipgroupController } from './tipgroup.controller';

describe('TipgroupController', () => {
  let controller: TipgroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipgroupController],
    }).compile();

    controller = module.get<TipgroupController>(TipgroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
