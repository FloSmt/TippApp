import { Injectable } from '@nestjs/common';
import { TipgroupUserRepository } from '@tippapp/backend/shared';

@Injectable()
export class TipgroupMembersService {
  constructor(private readonly tipgroupUserRepository: TipgroupUserRepository) {}

  async isUserMemberOfTipgroup(userId: number, tipgroupId: number): Promise<boolean> {
    const membership = await this.tipgroupUserRepository.findOne({
      where: {
        userId: userId,
        tipgroupId: tipgroupId,
      },
    });

    return !!membership;
  }
}
