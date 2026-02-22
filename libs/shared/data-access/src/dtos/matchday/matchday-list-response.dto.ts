import { ApiProperty } from '@nestjs/swagger';
import { MatchdayOverviewResponseDto } from './matchday-overview-response.dto';

export class MatchdayListResponseDto {
  @ApiProperty()
  currentMatchdayId: number;

  @ApiProperty()
  matchdays: MatchdayOverviewResponseDto[];
}
