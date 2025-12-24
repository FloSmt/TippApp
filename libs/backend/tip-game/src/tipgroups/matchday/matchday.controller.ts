import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ErrorCodes, MatchdayResponseDto } from '@tippapp/shared/data-access';
import { ErrorResponse } from '@tippapp/backend/error-handling';
import { DefaultResponse } from '@tippapp/backend/shared';
import { MatchdayService } from './matchday.service';
import { IsTipgroupMemberGuard } from '../../guards/is-tipgroup-member.guard.service';

@Controller('tipgroups/:tipgroupId/seasons/:seasonId/matchdays')
@ApiBearerAuth()
@UseGuards(IsTipgroupMemberGuard)
export class MatchdayController {
  constructor(private matchdayService: MatchdayService) {}

  @Get(':matchdayId')
  @ApiParam({
    name: 'tipgroupId',
    description: 'The ID of the matchday',
    type: Number,
  })
  @ApiParam({
    name: 'seasonId',
    description: 'The ID of the season',
    type: Number,
  })
  @ApiParam({
    name: 'matchdayId',
    description: 'The ID of the matchday',
    type: Number,
  })
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'Gets details of a specific matchday including all matches',
    responseType: MatchdayResponseDto,
  })
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.Tipgroup.MATCHDAY_DETAILS_NOT_FOUND)
  public async getMatchday(@Param() params: { tipgroupId: number; seasonId: number; matchdayId: number }) {
    return this.matchdayService.getMatchdayDetails(params.tipgroupId, params.seasonId, params.matchdayId);
  }
}
