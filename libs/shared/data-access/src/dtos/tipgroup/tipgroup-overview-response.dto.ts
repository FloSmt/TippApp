import { ApiProperty } from '@nestjs/swagger';

export class TipgroupOverviewResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  currentSeasonId: number | null;

  @ApiProperty()
  name: string;
}
