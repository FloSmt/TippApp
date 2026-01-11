import { ApiProperty } from '@nestjs/swagger';

export class MatchScoreDto {
  @ApiProperty()
  homeTeamScore: number | null;

  @ApiProperty()
  awayTeamScore: number | null;
}
