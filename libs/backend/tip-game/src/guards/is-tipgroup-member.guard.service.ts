import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { ErrorCodes } from '@tippapp/shared/data-access';
import { TipgroupMembersService } from '../tipgroup-members/tipgroup-members.service';

@Injectable()
export class IsTipgroupMemberGuard implements CanActivate {
  constructor(
    private readonly tipgroupMembersService: TipgroupMembersService,
    private readonly errorManagerService: ErrorManagerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const tipgroupId = request.params.tipgroupId;

    if (!userId || !tipgroupId) {
      throw this.errorManagerService.createError(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
    }

    const isMember = await this.tipgroupMembersService.isUserMemberOfTipgroup(userId, tipgroupId);

    if (!isMember) {
      throw this.errorManagerService.createError(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
