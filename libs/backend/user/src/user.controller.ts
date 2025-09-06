import {Controller, Get, HttpCode, HttpStatus, Request} from '@nestjs/common';
import {ApiBearerAuth, ApiOkResponse, ApiOperation} from '@nestjs/swagger';
import {Tipgroup, TipgroupEntryResponseDto} from '@tippapp/shared/data-access';
import {UserService} from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('tipgroups')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TipgroupEntryResponseDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'returns the list of tipgroups for the user',
  })
  async getTipgroups(@Request() req: any): Promise<TipgroupEntryResponseDto[]> {
    const userId = req.user.id;

    const tipgroups: Tipgroup[] = await this.userService.getTipGroupsByUserId(
      userId
    );

    return tipgroups.map((group) => ({name: group.name, id: group.id}));
  }
}
