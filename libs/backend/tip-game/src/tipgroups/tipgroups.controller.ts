import { Body, Controller, Get, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import {
  CreateTipgroupDto,
  ErrorCodes,
  LeagueOverviewResponseDto,
  Tipgroup,
  TipgroupDetailsResponseDto,
  TipgroupOverviewResponseDto,
} from '@tippapp/shared/data-access';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiService } from '@tippapp/backend/api';
import { ErrorResponse } from '@tippapp/backend/error-handling';
import { DefaultResponse } from '@tippapp/backend/shared';
import { TipgroupsService } from './tipgroups.service';
import { IsTipgroupMemberGuard } from '../guards/is-tipgroup-member.guard.service';

@Controller('tipgroups')
@ApiBearerAuth()
export class TipgroupsController {
  constructor(private readonly tipgroupService: TipgroupsService, private readonly apiService: ApiService) {}

  @Post()
  @DefaultResponse({
    httpStatus: HttpStatus.CREATED,
    endpointSummary: 'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches',
    responseType: TipgroupOverviewResponseDto,
  })
  @ErrorResponse(HttpStatus.CONFLICT, ErrorCodes.CreateTipgroup.TIPGROUP_NAME_TAKEN)
  @ErrorResponse(HttpStatus.BAD_REQUEST, ErrorCodes.User.USER_NOT_FOUND)
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.CreateTipgroup.LEAGUE_NOT_FOUND)
  async create(
    @Body() createTipgroupDto: CreateTipgroupDto,
    @Request() req: any
  ): Promise<TipgroupOverviewResponseDto> {
    const userId = req.user.id;
    const tipgroup = await this.tipgroupService.createTipgroup(createTipgroupDto, userId);

    return {
      id: tipgroup.id,
      name: tipgroup.name,
      currentSeasonId: tipgroup.seasons[0]?.id || null,
    };
  }

  @Get()
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'returns the list of tipgroups for the user',
    responseType: TipgroupOverviewResponseDto,
    isArray: true,
  })
  async getTipgroups(@Request() req: any): Promise<TipgroupOverviewResponseDto[]> {
    const userId = req.user.id;

    const tipgroups: Tipgroup[] = await this.tipgroupService.getTipgroupsByUserId(userId);

    return tipgroups.map((group) => ({
      name: group.name,
      id: group.id,
      currentSeasonId: group.seasons[0]?.id || null,
    }));
  }

  @Get('getAvailableLeagues')
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'responses a list of available leagues for creating a new matchday',
    responseType: LeagueOverviewResponseDto,
    isArray: true,
  })
  async getAvailableLeagues(): Promise<LeagueOverviewResponseDto[]> {
    return this.apiService.getAvailableLeagues();
  }

  @Get('/:tipgroupId')
  @UseGuards(IsTipgroupMemberGuard)
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'returns the tipgroup details for the given tipgroup id',
    responseType: TipgroupDetailsResponseDto,
  })
  async getTipgroupDetails(@Request() req: any): Promise<TipgroupDetailsResponseDto> {
    const tipgroupId = req.params.tipgroupId;

    const tipgroup: Tipgroup = await this.tipgroupService.getTipgroupById(tipgroupId);

    return { id: tipgroup.id, name: tipgroup.name, currentSeasonId: tipgroup.seasons[0]?.id || null };
  }
}
