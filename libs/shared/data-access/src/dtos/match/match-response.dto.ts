import { ApiProperty } from '@nestjs/swagger';
import { TeamDto } from './team.dto';
import { MatchScoreDto } from './match-score.dto';

export class MatchResponseDto {
  @ApiProperty()
  matchId: number;

  @ApiProperty()
  lastUpdatedDateTime: string;

  @ApiProperty()
  scheduledDateTime: string;

  @ApiProperty()
  isFinished: boolean;

  @ApiProperty()
  homeTeam: TeamDto;

  @ApiProperty()
  awayTeam: TeamDto;

  @ApiProperty()
  scores: MatchScoreDto;
}
