import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export interface defaultResponseParams {
  httpStatus: HttpStatus;
  endpointSummary?: string;
  responseType?: any;
  description?: string;
  isArray?: boolean;
}

export function DefaultResponse(defaultResponseParams: defaultResponseParams) {
  return applyDecorators(
    HttpCode(defaultResponseParams.httpStatus),
    ApiResponse({
      status: defaultResponseParams.httpStatus,
      type: defaultResponseParams.responseType,
      isArray: defaultResponseParams.isArray || false,
      description: defaultResponseParams.description || '',
    }),
    ApiOperation({
      summary: defaultResponseParams.endpointSummary || '',
    })
  );
}
