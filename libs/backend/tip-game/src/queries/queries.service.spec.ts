import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { QueriesService } from './queries.service';

describe('QueriesService', () => {
  let service: QueriesService;
  let dataSourceMock: DeepMocked<DataSource>;

  beforeEach(async () => {
    dataSourceMock = createMock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueriesService,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<QueriesService>(QueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
