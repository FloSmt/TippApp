import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorDto, ErrorCodes, MatchdayResponseDto } from '@tippapp/shared/data-access';
import { MatchdayService } from './matchday.service';

@Controller('tipgroups/:tipgroupId/seasons/:seasonId/matchdays')
@ApiBearerAuth()
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gets details of a specific matchday including all matches',
  })
  @ApiOkResponse({
    type: MatchdayResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matchday not found',
    type: ApiErrorDto,
    example: ErrorCodes.Tipgroup.MATCHDAY_DETAILS_NOT_FOUND,
  })
  public async getMatchday(@Param() params: { tipgroupId: number; seasonId: number; matchdayId: number }) {
    return this.matchdayService.getMatchdayDetails(params.tipgroupId, params.seasonId, params.matchdayId);
  }
}
