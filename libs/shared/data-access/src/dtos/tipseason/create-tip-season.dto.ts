import { CreateMatchdayDto } from '../matchday/create-matchday.dto';

export class CreateTipSeasonDto {
  api_LeagueSeason: number;
  isClosed: boolean;
  matchdays: CreateMatchdayDto[];
}
