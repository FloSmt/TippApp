import {ApiProperty} from '@nestjs/swagger';

export class TipgroupEntryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
