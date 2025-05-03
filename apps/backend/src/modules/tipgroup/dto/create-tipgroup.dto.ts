import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateTipgroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  leagueShortcut: string;

  @IsNumber()
  @IsNotEmpty()
  currentSeason: number;
}
