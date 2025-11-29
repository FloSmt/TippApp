import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeagueResponse } from '../../apiResponses';

export class LeagueOverviewResponseDto implements Partial<LeagueResponse> {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'LeagueId from OpenLigaDB',
  })
  leagueId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1. Fußball Bundesliga',
    description: 'Name of the League from OpenLigaDB',
  })
  leagueName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'bl1',
    description: 'LeagueShortcut from OpenLigaDB',
  })
  leagueShortcut: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2024, description: 'Season from OpenLigaDB' })
  leagueSeason: number;
}
