import { Match } from '@tippapp/backend/database';

export class CreateMatchDto implements Partial<Match> {
  api_matchId: number;
}
