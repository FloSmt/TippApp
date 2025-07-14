import { ApiProperty } from '@nestjs/swagger';
import { CreateMatchDto } from '../match/create-match.dto';

export class CreateMatchdayDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  api_groupId: number;

  @ApiProperty()
  matches: CreateMatchDto[];
}
