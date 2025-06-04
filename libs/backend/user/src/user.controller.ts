import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TipgroupResponseDto } from '@tippapp/shared/data-access';
import { Tipgroup } from '@tippapp/backend/database';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('tipgroups')
  @ApiBearerAuth()
  async getTipgroups(@Request() req: any): Promise<TipgroupResponseDto[]> {
    const userId = req.user.sub;

    const tipgroups: Tipgroup[] = await this.userService.getTipGroupsByUserId(
      userId
    );

    return tipgroups.map((group) => ({ name: group.name, id: group.id }));
  }
}
