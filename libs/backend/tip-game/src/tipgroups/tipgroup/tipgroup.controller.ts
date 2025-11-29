import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { MatchdayOverviewResponseDto, MatchdayResponseDto } from '@tippapp/shared/data-access';

@Controller('tipgroup')
export class TipgroupController {
  @Get(':tipgroupId/:seasonId/getMatchday/:matchdayId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gets details of a specific matchday including all matches',
  })
  @ApiOkResponse({
    type: MatchdayResponseDto,
  })
  public async getMatchday() {
    // Implementation goes here
  }

  @Get(':tipgroupId/:seasonId/getAllMatchdays')
  @ApiBearerAuth()
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
