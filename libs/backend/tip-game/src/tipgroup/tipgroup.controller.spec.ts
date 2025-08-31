import {Test, TestingModule} from '@nestjs/testing';
import {createMock, DeepMocked} from '@golevelup/ts-jest';
import {CreateTipgroupDto, Tipgroup, TipgroupEntryResponseDto,} from '@tippapp/shared/data-access';
import {TipgroupService} from './tipgroup.service';
import {TipgroupController} from './tipgroup.controller';

describe('TipgroupController', () => {
  let controller: TipgroupController;
  let tipgroupService: DeepMocked<TipgroupService>;

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

    get tipgroupResponse(): TipgroupEntryResponseDto {
      return {
        name: 'Tipgroup1',
        id: 1,
      };
    },

    get createTipgroupDtoMock(): CreateTipgroupDto {
      return {
        name: 'Tipgroup1',
        passwordHash: '123',
        leagueShortcut: 'bl1',
        currentSeason: 2024,
      };
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipgroupController],
      providers: [
        TipgroupService,
        {
          provide: TipgroupService,
          useValue: createMock<TipgroupService>(),
        },
      ],
    }).compile();

    controller = module.get<TipgroupController>(TipgroupController);
    tipgroupService = module.get(TipgroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return tipgroup-response', async () => {
    tipgroupService.createTipgroup.mockResolvedValueOnce(mocks.tipgroupMock);
    const req = {user: {id: 1}};

    const result = await controller.create(mocks.createTipgroupDtoMock, req);

    expect(tipgroupService.createTipgroup).toHaveBeenCalledWith(
      mocks.createTipgroupDtoMock,
      req.user.id
    );
    expect(result).toEqual(mocks.tipgroupResponse);
  });
});
