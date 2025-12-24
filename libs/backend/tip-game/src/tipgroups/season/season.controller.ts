import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { IsTipgroupMemberGuard } from '../../guards/is-tipgroup-member.guard.service';

@Controller('tipgroups/:tipgroupId/season/:seasonId')
@ApiBearerAuth()
@UseGuards(IsTipgroupMemberGuard)
export class SeasonController {
  @Get('getAllMatchdays')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gets an overview of all matchday in the current season',
  })
  @ApiOkResponse({
    type: MatchdayOverviewResponseDto,
    isArray: true,
  })
  public async getAllMatchdays() {
    // Implementation goes here
  }
}
