import { Test, TestingModule } from '@nestjs/testing';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { ExecutionContext } from '@nestjs/common';
import { IsTipgroupMemberGuard } from './is-tipgroup-member.guard.service';
import { TipgroupMembersService } from '../tipgroup-members/tipgroup-members.service';

describe('IsTipgroupMemberGuard', () => {
  let guard: IsTipgroupMemberGuard;

  const tipgroupMembersServiceMock = {
    isUserMemberOfTipgroup: jest.fn(),
  };

  const errorManagerServiceMock = {
    createError: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsTipgroupMemberGuard,
        {
          provide: TipgroupMembersService,
          useValue: tipgroupMembersServiceMock,
        },
        {
          provide: ErrorManagerService,
          useValue: errorManagerServiceMock,
        },
      ],
    }).compile();

    guard = module.get<IsTipgroupMemberGuard>(IsTipgroupMemberGuard);
  });

  // Helper Funktion um den ExecutionContext zu simulieren
  const createMockContext = (userId?: string, tipgroupId?: string): Partial<ExecutionContext> =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { id: userId } : {},
          params: { tipgroupId },
        }),
      }),
    } as any);

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is a member', async () => {
    const context = createMockContext('user123', 'group456');
    tipgroupMembersServiceMock.isUserMemberOfTipgroup.mockResolvedValue(true);

    const result = await guard.canActivate(context as ExecutionContext);

    expect(result).toBe(true);
    expect(tipgroupMembersServiceMock.isUserMemberOfTipgroup).toHaveBeenCalledWith('user123', 'group456');
  });

  it('should throw error if user is NOT a member', async () => {
    const context = createMockContext('user123', 'group456');
    tipgroupMembersServiceMock.isUserMemberOfTipgroup.mockResolvedValue(false);

    // Wir mocken den Error, den der ErrorManager zurückgeben würde
    const mockError = new Error('Not a member');
    errorManagerServiceMock.createError.mockReturnValue(mockError);

    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow('Not a member');
    expect(errorManagerServiceMock.createError).toHaveBeenCalled();
  });

  it('should throw error if userId or tipgroupId is missing', async () => {
    const context = createMockContext(undefined, undefined); // Fehlende IDs

    const mockError = new Error('Missing IDs');
    errorManagerServiceMock.createError.mockReturnValue(mockError);

    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow('Missing IDs');
  });
});
