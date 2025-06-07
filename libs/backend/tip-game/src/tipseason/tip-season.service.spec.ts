import {Test, TestingModule} from '@nestjs/testing';
import {TipSeasonService} from './tip-season.service';
import {CreateTipSeasonDto} from "@tippapp/shared/data-access";
import {createMock, DeepMocked} from "@golevelup/ts-jest";
import {MatchdayService} from "@tippapp/backend/tip-game";
import {Repository} from "typeorm";
import {TipSeason} from "@tippapp/backend/database";
import {getRepositoryToken} from "@nestjs/typeorm";

describe('TipSeasonService', () => {
  let service: TipSeasonService;
  let matchdayService: DeepMocked<MatchdayService>
  let tipSeasonRepository: DeepMocked<Repository<TipSeason>>;

  const createTipSeasonDtoMock = {
    api_LeagueSeason: 2020,
    isClosed: false,
    matchdays: [{
      api_groupId: 1,
      name: "Matchday",
      matches: []
    }]
  } as CreateTipSeasonDto

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipSeasonService,
        {
          provide: MatchdayService,
          useValue: createMock<MatchdayService>()
        },
        {
          provide: getRepositoryToken(TipSeason),
          useValue: createMock<Repository<TipSeason>>(),
        },
      ],
    }).compile();

    service = module.get<TipSeasonService>(TipSeasonService);
    matchdayService = module.get(MatchdayService)
    tipSeasonRepository = module.get(getRepositoryToken(TipSeason));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a TipSeason Entity with 1 Matchday', () => {
    const response = service.createNewTipSeason(createTipSeasonDtoMock);
    expect(response.isClosed).toBe(createTipSeasonDtoMock.isClosed);

    expect(response.matchdays.length).toBe(1);
    expect(matchdayService.createMatchday).toHaveBeenCalledTimes(1);
    expect(matchdayService.createMatchday).toHaveBeenCalledWith(createTipSeasonDtoMock.matchdays[0]);
  });

  it('should save the TipSeason', () => {
    const tipSeason: TipSeason = service.createNewTipSeason(createTipSeasonDtoMock);

    service.saveTipSeason(tipSeason);

    expect(tipSeasonRepository.save).toHaveBeenCalledTimes(1);
    expect(tipSeasonRepository.create).toHaveBeenCalledTimes(1);
    expect(tipSeasonRepository.create).toHaveBeenCalledWith(tipSeason);
  });
});
