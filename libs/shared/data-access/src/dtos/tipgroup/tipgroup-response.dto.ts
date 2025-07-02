import { ApiProperty } from '@nestjs/swagger';

export class TipgroupResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
