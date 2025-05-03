import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import {Match} from "../../database/entities/match.entity";

@Injectable()
export class MatchService {
  createMatch(createMatchDto: CreateMatchDto): Match {
    const newMatch = new Match();
    newMatch.api_matchId = createMatchDto.api_matchId;
    return newMatch;
  }

}
