import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { DefaultResponse } from '@tippapp/backend/shared';
import { IsTipgroupMemberGuard } from '../../guards/is-tipgroup-member.guard.service';

@Controller('tipgroups/:tipgroupId/season/:seasonId')
@ApiBearerAuth()
@UseGuards(IsTipgroupMemberGuard)
export class SeasonController {
  @Get('getAllMatchdays')
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'Gets an overview of all matchday in the given season',
    responseType: MatchdayOverviewResponseDto,
    isArray: true,
  })
  public async getAllMatchdays() {
    // Implementation goes here
  }
}
