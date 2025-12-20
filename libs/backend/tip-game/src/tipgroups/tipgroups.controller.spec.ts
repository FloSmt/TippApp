import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  CreateTipgroupDto,
  LeagueOverviewResponseDto,
  Tipgroup,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { ApiService } from '@tippapp/backend/api';
import { TipgroupsService } from './tipgroups.service';
import { TipgroupsController } from './tipgroups.controller';

describe('TipgroupsController', () => {
  let controller: TipgroupsController;
  let tipgroupService: DeepMocked<TipgroupsService>;
  let apiService: DeepMocked<ApiService>;

  const mocks = {
    get tipgroupMock(): Tipgroup {
      return {
        createDate: new Date('1.1.1970'),
        passwordHash: '',
        seasons: [],
        users: [],
        name: 'Tipgroup1',
        id: 1,
      };
    },

    get availableLeaguesMock(): LeagueOverviewResponseDto[] {
      return [
        {
          leagueId: 1,
          leagueName: '1. Fußball Bundesliga',
          leagueShortcut: 'bl1',
          leagueSeason: 2024,
        },
        {
          leagueId: 2,
          leagueName: '2. Fußball Bundesliga',
          leagueShortcut: 'bl2',
          leagueSeason: 2023,
        },
      ];
    },

    get tipgroupResponse(): TipgroupEntryResponseDto {
      return {
        name: 'Tipgroup1',
        id: 1,
      };
    },

    get createTipgroupDtoMock(): CreateTipgroupDto {
      return {
        name: 'Tipgroup1',
        password: '123',
        leagueShortcut: 'bl1',
        currentSeason: 2024,
      };
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipgroupsController],
      providers: [
        TipgroupsService,
        {
          provide: TipgroupsService,
          useValue: createMock<TipgroupsService>(),
        },
        {
          provide: ApiService,
          useValue: createMock<ApiService>(),
        },
      ],
    }).compile();

    controller = module.get<TipgroupsController>(TipgroupsController);
    tipgroupService = module.get(TipgroupsService);
    apiService = module.get(ApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return matchday-response after creating a new Tipgroup', async () => {
    tipgroupService.createTipgroup.mockResolvedValueOnce(mocks.tipgroupMock);
    const req = { user: { id: 1 } };

    const result = await controller.create(mocks.createTipgroupDtoMock, req);

    expect(tipgroupService.createTipgroup).toHaveBeenCalledWith(mocks.createTipgroupDtoMock, req.user.id);
    expect(result).toEqual(mocks.tipgroupResponse);
  });

  it('should return available Leagues', async () => {
    apiService.getAvailableLeagues.mockResolvedValueOnce(mocks.availableLeaguesMock);

    const result = await controller.getAvailableLeagues();

    expect(apiService.getAvailableLeagues).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mocks.availableLeaguesMock);
  });

  it('should return tipgroups of the user', async () => {
    const tipgroup1 = new Tipgroup();
    tipgroup1.id = 101;
    tipgroup1.name = 'Group1';

    const tipgroup2 = new Tipgroup();
    tipgroup2.id = 102;
    tipgroup2.name = 'Group2';

    const req = { user: { id: 1 } };

    tipgroupService.getTipGroupsByUserId.mockResolvedValue([tipgroup1, tipgroup2]);
    const result = await controller.getTipgroups(req);

    expect(tipgroupService.getTipGroupsByUserId).toHaveBeenCalledTimes(1);
    expect(tipgroupService.getTipGroupsByUserId).toHaveBeenCalledWith(req.user.id);
    expect(result).toEqual([
      { name: tipgroup1.name, id: tipgroup1.id },
      { name: tipgroup2.name, id: tipgroup2.id },
    ]);
  });
});
