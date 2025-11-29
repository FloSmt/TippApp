import { ApiProperty } from '@nestjs/swagger';
import { MatchResponseDto } from '../match/match-response.dto';
import { MatchdayOverviewResponseDto } from './matchday-overview-response.dto';

export class MatchdayResponseDto extends MatchdayOverviewResponseDto {
  @ApiProperty({ type: () => [MatchResponseDto] })
  matches: MatchResponseDto[];
}
