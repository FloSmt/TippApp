import {Injectable} from '@nestjs/common';
import {CreateMatchdayDto} from '@tippapp/shared/data-access';
import {MatchService} from '../match';
import {Matchday} from '@tippapp/backend/database';

@Injectable()
export class MatchdayService {
  constructor(
    private matchService: MatchService
  ) {}

  createMatchday(createMatchdayDto: CreateMatchdayDto): Matchday {
    const newMatchday = new Matchday();
    newMatchday.api_groupId = createMatchdayDto.api_groupId;
    newMatchday.name = createMatchdayDto.name;
    newMatchday.matches = [];

    createMatchdayDto.matches.forEach((match) => {
      const newMatch = this.matchService.createMatch(match);
      newMatchday.matches.push(newMatch);
    });

    return newMatchday;
  }
}
