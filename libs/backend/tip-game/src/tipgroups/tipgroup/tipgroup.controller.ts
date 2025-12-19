import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MatchdayOverviewResponseDto, MatchdayResponseDto } from '@tippapp/shared/data-access';
import { TipgroupService } from './tipgroup.service';
import { Public } from '../../../../auth/src/guards/jwt-auth.guard';

@Controller('tipgroup')
@Public()
// @ApiBearerAuth()
export class TipgroupController {
  constructor(private tipgroupService: TipgroupService) {}

  @Get(':tipgroupId/:seasonId/getMatchday/:matchdayId')
  @ApiParam({
    name: 'tipgroupId',
    description: 'The ID of the tipgroup',
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
  public async getMatchday(@Param() params: { tipgroupId: number; seasonId: number; matchdayId: number }) {
    return this.tipgroupService.getMatchdayDetails(params.tipgroupId, params.seasonId, params.matchdayId);
  }

  @Get(':tipgroupId/:seasonId/getAllMatchdays')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gets an overview of all matchdays in the current season',
  })
  @ApiOkResponse({
    type: MatchdayOverviewResponseDto,
    isArray: true,
  })
  public async getAllMatchdays() {
    // Implementation goes here
  }
}
