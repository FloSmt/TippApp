import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApiUpdatesController } from './api-updates.controller';
import { ApiUpdatesService } from './api-updates.service';

describe('ApiUpdatesController', () => {
  let controller: ApiUpdatesController;
  let apiUpdatesServiceMock: DeepMocked<ApiUpdatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiUpdatesController],
      providers: [{ provide: ApiUpdatesService, useValue: createMock<ApiUpdatesService>() }],
    }).compile();

    controller = module.get<ApiUpdatesController>(ApiUpdatesController);
    apiUpdatesServiceMock = module.get(ApiUpdatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call handleApiUpdate on service', async () => {
    const payload = { some: 'data' };

    await controller.handleApiUpdate(payload);

    expect(apiUpdatesServiceMock.handleApiUpdate).toHaveBeenCalledWith(payload);
  });
});
