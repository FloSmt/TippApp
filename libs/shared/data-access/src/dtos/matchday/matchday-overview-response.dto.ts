import { ApiProperty } from '@nestjs/swagger';
import { LeagueOverviewResponseDto } from '../tipgroup';

export class MatchdayOverviewResponseDto {
  @ApiProperty()
  matchdayId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  league: LeagueOverviewResponseDto;

  @ApiProperty()
  matchCount: number;
}
