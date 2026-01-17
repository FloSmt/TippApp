import { ApiProperty } from '@nestjs/swagger';

export class TeamDto {
  @ApiProperty()
  teamId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  logoUrl: string;
}
