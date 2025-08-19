import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorDetail } from '@tippapp/shared/data-access';
import { ApiError } from './api-error';

@Injectable()
export class ErrorManagerService {
  createError(
    errorDetail: ApiErrorDetail,
    httpStatus: HttpStatus
  ): HttpException {
    const errorBody = new ApiError(
      errorDetail.code,
      errorDetail.message,
      httpStatus || HttpStatus.BAD_REQUEST
    );

    throw new HttpException(errorBody, errorBody.status);
  }
}
