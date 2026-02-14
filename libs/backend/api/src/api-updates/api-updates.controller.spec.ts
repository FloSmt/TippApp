import { Test, TestingModule } from '@nestjs/testing';
import { ApiUpdatesController } from './api-updates.controller';

describe('ApiUpdatesController', () => {
  let controller: ApiUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiUpdatesController],
    }).compile();

    controller = module.get<ApiUpdatesController>(ApiUpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
