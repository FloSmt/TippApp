import { ApiProperty } from '@nestjs/swagger';
import { MatchResponseDto } from '../match/match-response.dto';
import { MatchdayOverviewResponseDto } from './matchday-overview-response.dto';
import { LeagueOverviewResponseDto } from '../tipgroup';

export class MatchdayResponseDto extends MatchdayOverviewResponseDto {
  @ApiProperty()
  league: LeagueOverviewResponseDto;

  @ApiProperty({ type: () => [MatchResponseDto] })
  matches: MatchResponseDto[];
}
