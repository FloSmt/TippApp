import {Test, TestingModule} from '@nestjs/testing';
import {MatchdayService} from './matchday.service';
import {CreateMatchdayDto} from "@tippapp/shared/data-access";
import {createMock, DeepMocked} from "@golevelup/ts-jest";
import {MatchService} from "@tippapp/backend/tip-game";

describe('MatchdayService', () => {
  let service: MatchdayService;
  let matchService: DeepMocked<MatchService>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchdayService,
        {
          provide: MatchService,
          useValue: createMock<MatchService>()
        }
      ],
    }).compile();

    service = module.get<MatchdayService>(MatchdayService);
    matchService = module.get(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a Matchday Entity with 2 Matches', () => {
    const createMatchdayDtoMock = {
      api_groupId: "1",
      name: "Matchday",
      matches: [{
        api_matchId: 1,
      },
        {
          api_matchId: 2,
        }]
    } as CreateMatchdayDto

    const response = service.createMatchday(createMatchdayDtoMock);
    expect(response.name).toBe(createMatchdayDtoMock.name);
    expect(response.api_groupId).toBe(createMatchdayDtoMock.api_groupId);
    expect(response.matches.length).toBe(2);
    expect(matchService.createMatch).toHaveBeenCalledTimes(2);
    expect(matchService.createMatch.mock.calls).toEqual([[{"api_matchId": 1}], [{"api_matchId": 2}]]);
  })
});
