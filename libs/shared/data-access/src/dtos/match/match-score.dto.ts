import { ApiProperty } from '@nestjs/swagger';

export class MatchScoreDto {
  @ApiProperty()
  homeTeamScore: number;

  @ApiProperty()
  awayTeamScore: number;
}
