import { ApiProperty } from '@nestjs/swagger';
import { CreateMatchdayDto } from '../matchday/create-matchday.dto';

export class CreateTipSeasonDto {
  @ApiProperty()
  api_LeagueSeason: number;

  @ApiProperty()
  isClosed: boolean;

  @ApiProperty()
  matchdays: CreateMatchdayDto[];
}
