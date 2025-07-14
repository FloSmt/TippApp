import { Injectable } from '@nestjs/common';
import { CreateMatchDto, Match } from '@tippapp/shared/data-access';

@Injectable()
export class MatchService {
  createMatch(createMatchDto: CreateMatchDto): Match {
    const newMatch = new Match();
    newMatch.api_matchId = createMatchDto.api_matchId;
    return newMatch;
  }
}
