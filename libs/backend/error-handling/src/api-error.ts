import { HttpStatus } from '@nestjs/common';

export class ApiError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST
  ) {}
}
