import { ErrorCodes } from '@tippapp/shared/data-access';
import { HttpStatus } from '@nestjs/common';
import { IsTipgroupMemberGuard } from './is-tipgroup-member.guard.service';

describe('IsTipgroupMemberGuard', () => {
  let guard: IsTipgroupMemberGuard;
  let tipgroupsServiceMock: { isUserMemberOfTipgroup: jest.Mock };
  let errorManagerMock: { createError: jest.Mock };

  const createContext = (userId?: string, tipgroupId?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId !== undefined ? { id: userId } : {},
          params: tipgroupId !== undefined ? { tipgroupId } : {},
        }),
      }),
    } as any);

  beforeEach(() => {
    tipgroupsServiceMock = { isUserMemberOfTipgroup: jest.fn() };
    errorManagerMock = { createError: jest.fn() };
    guard = new IsTipgroupMemberGuard(tipgroupsServiceMock as any, errorManagerMock as any);
  });

  it('throws when userId or tipgroupId is missing', () => {
    const createdError = new Error('forbidden');
    errorManagerMock.createError.mockReturnValue(createdError);

    const ctx = createContext(undefined, undefined);
    expect(() => guard.canActivate(ctx)).toThrow(createdError);
    expect(errorManagerMock.createError).toHaveBeenCalledWith(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
  });

  it('throws when user is not a member of the tipgroup', () => {
    const createdError = new Error('forbidden');
    errorManagerMock.createError.mockReturnValue(createdError);
    tipgroupsServiceMock.isUserMemberOfTipgroup.mockReturnValue(false);

    const ctx = createContext('user-1', 'group-1');
    expect(() => guard.canActivate(ctx)).toThrow(createdError);
    expect(tipgroupsServiceMock.isUserMemberOfTipgroup).toHaveBeenCalledWith('user-1', 'group-1');
    expect(errorManagerMock.createError).toHaveBeenCalledWith(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
  });

  it('returns true when user is a member of the tipgroup', () => {
    tipgroupsServiceMock.isUserMemberOfTipgroup.mockReturnValue(true);

    const ctx = createContext('user-1', 'group-1');
    expect(guard.canActivate(ctx)).toBe(true);
    expect(tipgroupsServiceMock.isUserMemberOfTipgroup).toHaveBeenCalledWith('user-1', 'group-1');
  });
});
