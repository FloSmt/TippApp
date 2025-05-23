import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMatchdayDto } from '@tippapp/shared/data-access';
import { MatchService } from 'libs/backend/match/src/match.service';
import { Matchday } from '@tippapp/backend/database';

@Injectable()
export class MatchdayService {
  constructor(
    @InjectRepository(Matchday)
    private matchdayRepository: Repository<Matchday>,
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
