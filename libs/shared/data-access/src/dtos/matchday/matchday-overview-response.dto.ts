import { ApiProperty } from '@nestjs/swagger';

export class MatchdayOverviewResponseDto {
  @ApiProperty()
  matchdayId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  matchCount: number;
}
