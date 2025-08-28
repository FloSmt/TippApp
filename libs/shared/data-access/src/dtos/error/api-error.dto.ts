import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({
    description: 'The unique error code (e.g., AUTH.USER_NOT_FOUND)',
  })
  code: string;

  @ApiProperty({
    description: 'A human-readable error message',
  })
  message: string;
}
