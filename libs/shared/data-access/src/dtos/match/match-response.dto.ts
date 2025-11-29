import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from './match-status';
import { TeamDto } from './team.dto';
import { MatchScoreDto } from './match-score.dto';

export class MatchResponseDto {
  @ApiProperty()
  matchId: number;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty()
  lastUpdatedDateTime: string;

  @ApiProperty()
  scheduledDateTime: string;

  @ApiProperty()
  homeTeam: TeamDto;

  @ApiProperty()
  awayTeam: TeamDto;

  @ApiProperty()
  scores: MatchScoreDto;
}
