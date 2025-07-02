import { CreateMatchdayDto } from '../matchday/create-matchday.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipSeasonDto {
  @ApiProperty()
  api_LeagueSeason: number;

  @ApiProperty()
  isClosed: boolean;

  @ApiProperty()
  matchdays: CreateMatchdayDto[];
}
