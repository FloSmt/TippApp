import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateTipgroupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "bl1", description: "LeagueShortcut from OpenLigaDB"})
  leagueShortcut: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({example: 2024, description: "Season from OpenLigaDB"})
  currentSeason: number;
}
