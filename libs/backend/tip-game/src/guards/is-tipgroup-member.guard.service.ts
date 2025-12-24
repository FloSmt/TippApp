import { CanActivate, ExecutionContext, forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { ErrorCodes } from '@tippapp/shared/data-access';
import { TipgroupsService } from '../tipgroups/tipgroups.service';

@Injectable()
export class IsTipgroupMemberGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => TipgroupsService))
    private readonly tipgroupsService: TipgroupsService,
    private readonly errorManagerService: ErrorManagerService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const tipgroupId = request.params.tipgroupId;

    if (!userId || !tipgroupId) {
      throw this.errorManagerService.createError(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
    }

    const isMember = this.tipgroupsService.isUserMemberOfTipgroup(userId, tipgroupId);

    if (!isMember) {
      throw this.errorManagerService.createError(ErrorCodes.Tipgroup.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
