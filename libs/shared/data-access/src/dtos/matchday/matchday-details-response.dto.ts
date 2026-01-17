import { ApiProperty } from '@nestjs/swagger';
import { MatchResponseDto } from '../match/match-response.dto';
import { MatchdayOverviewResponseDto } from './matchday-overview-response.dto';
import { LeagueOverviewResponseDto } from '../tipgroup';

export class MatchdayDetailsResponseDto extends MatchdayOverviewResponseDto {
  @ApiProperty()
  league: LeagueOverviewResponseDto;

  @ApiProperty({ type: () => [MatchResponseDto] })
  matchList: MatchResponseDto[];
}
