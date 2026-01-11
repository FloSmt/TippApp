import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ErrorCodes, MatchdayDetailsResponseDto, MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { DefaultResponse } from '@tippapp/backend/shared';
import { ErrorResponse } from '@tippapp/backend/error-handling';
import { SeasonService } from './season.service';
import { IsTipgroupMemberGuard } from '../../guards/is-tipgroup-member.guard.service';

@Controller('tipgroups/:tipgroupId/seasons/:seasonId')
@ApiBearerAuth()
@UseGuards(IsTipgroupMemberGuard)
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('getAllMatchdays')
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
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'Gets an overview of all matchday in the given season',
    responseType: MatchdayOverviewResponseDto,
    isArray: true,
  })
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.Tipgroup.SEASON_NOT_FOUND)
  public async getAllMatchdays(@Param() params: { tipgroupId: number; seasonId: number }) {
    return this.seasonService.getAllMatchdays(params.tipgroupId, params.seasonId);
  }

  @Get('getCurrentMatchday')
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
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'returns the current Matchday, depending on the kickoff dates of there matches',
    responseType: MatchdayDetailsResponseDto,
  })
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.Tipgroup.SEASON_NOT_FOUND)
  public async getCurrentMatchday(@Param() params: { tipgroupId: number; seasonId: number }) {
    return this.seasonService.getCurrentMatchday(params.tipgroupId, params.seasonId);
  }
}
