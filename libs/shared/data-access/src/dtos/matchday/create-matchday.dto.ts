import { CreateMatchDto } from '../match/create-match.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchdayDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  api_groupId: string;

  @ApiProperty()
  matches: CreateMatchDto[];
}
