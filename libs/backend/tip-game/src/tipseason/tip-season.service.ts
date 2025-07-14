import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipSeasonDto, TipSeason } from '@tippapp/shared/data-access';
import { MatchdayService } from '../matchday';

@Injectable()
export class TipSeasonService {
  constructor(
    @InjectRepository(TipSeason)
    private tipSeasonRepository: Repository<TipSeason>,
    private MatchdayService: MatchdayService
  ) {}
  createNewTipSeason(createTipSeasonDto: CreateTipSeasonDto): TipSeason {
    const newTipSeason = new TipSeason();
    newTipSeason.isClosed = createTipSeasonDto.isClosed;
    newTipSeason.matchdays = [];
    newTipSeason.api_LeagueSeason = createTipSeasonDto.api_LeagueSeason;

    createTipSeasonDto.matchdays.forEach((matchday) => {
      const newMatchday = this.MatchdayService.createMatchday(matchday);
      newTipSeason.matchdays.push(newMatchday);
    });

    return newTipSeason;
  }

  async saveTipSeason(tipSeason: TipSeason): Promise<TipSeason> {
    const savedTipSeason = this.tipSeasonRepository.create(tipSeason);
    return this.tipSeasonRepository.save(savedTipSeason);
  }
}
