import { Test, TestingModule } from '@nestjs/testing';
import { ApiErrorDetail } from '@tippapp/shared/data-access';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorManagerService } from './error-manager.service';
import { ApiError } from './api-error';

describe('ErrorManagerService', () => {
  let service: ErrorManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorManagerService],
    }).compile();

    service = module.get<ErrorManagerService>(ErrorManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return HttpException with correct ApiError and status', () => {
    const errorDetail: ApiErrorDetail = { code: 'TEST_CODE', message: 'Error' };
    const status = HttpStatus.NOT_FOUND;

    const result = service.createError(errorDetail, status);

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(status);

    const response = result.getResponse() as ApiError;
    expect(response.code).toBe(errorDetail.code);
    expect(response.message).toBe(errorDetail.message);
    expect(response.status).toBe(status);
  });
});
