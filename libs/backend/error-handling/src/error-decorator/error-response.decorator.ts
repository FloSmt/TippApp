import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorDto } from '@tippapp/shared/data-access';

export function ErrorResponse(httpStatus: HttpStatus, errorCode: ApiErrorDto) {
  return applyDecorators(
    ApiResponse({
      status: httpStatus,
      description: errorCode.message,
      example: errorCode,
      type: ApiErrorDto,
    })
  );
}
