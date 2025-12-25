import { Test, TestingModule } from '@nestjs/testing';
import { TipgroupUser } from '@tippapp/shared/data-access';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TipgroupUserRepository } from '@tippapp/backend/shared';
import { TipgroupMembersService } from './tipgroup-members.service';

describe('TipgroupMembersService', () => {
  let service: TipgroupMembersService;
  let tipgroupUserRepository: DeepMocked<TipgroupUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipgroupMembersService,
        {
          provide: TipgroupUserRepository,
          useValue: createMock<TipgroupUserRepository>(),
        },
      ],
    }).compile();

    service = module.get<TipgroupMembersService>(TipgroupMembersService);
    tipgroupUserRepository = module.get(TipgroupUserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isUserMemberOfTipgroup', () => {
    it('should return true if user is a member of the tipgroup', async () => {
      const userId = 1;
      const tipgroupId = 10;

      tipgroupUserRepository.findOne.mockResolvedValue({
        id: 100,
        userId: userId,
        tipgroupId: tipgroupId,
      } as unknown as TipgroupUser);

      const result = await service.isUserMemberOfTipgroup(userId, tipgroupId);

      expect(result).toBe(true);
      expect(tipgroupUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: userId,
          tipgroupId: tipgroupId,
        },
      });
    });

    it('should return false if user is not a member of the tipgroup', async () => {
      const userId = 2;
      const tipgroupId = 20;

      tipgroupUserRepository.findOne.mockResolvedValue(null);

      const result = await service.isUserMemberOfTipgroup(userId, tipgroupId);

      expect(result).toBe(false);
      expect(tipgroupUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: userId,
          tipgroupId: tipgroupId,
        },
      });
    });
  });
});
