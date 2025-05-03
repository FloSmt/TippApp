import { Injectable } from '@nestjs/common';
import { CreateTipSeasonDto } from './dto/create-tip-season.dto';
import {TipSeason} from "../../database/entities/tipSeason.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {MatchdayService} from "../matchday/matchday.service";

@Injectable()
export class TipSeasonService {

  constructor(
    @InjectRepository(TipSeason)
    private tipSeasonRepository: Repository<TipSeason>,
    private MatchdayService: MatchdayService
  ) {}
  createNewTipSeason(createTipSeasonDto: CreateTipSeasonDto): TipSeason {
    const newTipSeason = new TipSeason();
    newTipSeason.isClosed = false;
    newTipSeason.matchdays = [];
    createTipSeasonDto.matchdays.forEach(matchday => {
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
