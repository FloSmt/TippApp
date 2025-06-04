import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from '@tippapp/shared/data-access';
import { Match } from '@tippapp/backend/database';

@Injectable()
export class MatchService {
  createMatch(createMatchDto: CreateMatchDto): Match {
    const newMatch = new Match();
    newMatch.api_matchId = createMatchDto.api_matchId;
    return newMatch;
  }
}
