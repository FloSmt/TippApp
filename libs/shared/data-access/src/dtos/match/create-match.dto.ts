import { Match } from '../../entities';

export class CreateMatchDto implements Partial<Match> {
  api_matchId: number;
}
