import {Match} from "../../../database/entities/match.entity";

export class CreateMatchDto implements Partial<Match> {
  api_matchId: number;
}
