import { Body, Controller, Get, HttpStatus, Post, Request } from '@nestjs/common';
import {
  CreateTipgroupDto,
  ErrorCodes,
  LeagueOverviewResponseDto,
  Tipgroup,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiService } from '@tippapp/backend/api';
import { ErrorResponse } from '@tippapp/backend/error-handling';
import { DefaultResponse } from '@tippapp/backend/shared';
import { TipgroupsService } from './tipgroups.service';

@Controller('tipgroups')
@ApiBearerAuth()
export class TipgroupsController {
  constructor(private readonly tipgroupService: TipgroupsService, private readonly apiService: ApiService) {}

  @Post()
  @DefaultResponse({
    httpStatus: HttpStatus.CREATED,
    endpointSummary: 'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches',
    responseType: TipgroupEntryResponseDto,
  })
  @ErrorResponse(HttpStatus.CONFLICT, ErrorCodes.CreateTipgroup.TIPGROUP_NAME_TAKEN)
  @ErrorResponse(HttpStatus.BAD_REQUEST, ErrorCodes.User.USER_NOT_FOUND)
  @ErrorResponse(HttpStatus.NOT_FOUND, ErrorCodes.CreateTipgroup.LEAGUE_NOT_FOUND)
  async create(@Body() createTipgroupDto: CreateTipgroupDto, @Request() req: any): Promise<TipgroupEntryResponseDto> {
    const userId = req.user.id;
    const tipgroup = await this.tipgroupService.createTipgroup(createTipgroupDto, userId);

    return {
      id: tipgroup.id,
      name: tipgroup.name,
    };
  }

  @Get()
  @DefaultResponse({
    httpStatus: HttpStatus.OK,
    endpointSummary: 'returns the list of tipgroups for the user',
    responseType: TipgroupEntryResponseDto,
    isArray: true,
  })
  async getTipgroups(@Request() req: any): Promise<TipgroupEntryResponseDto[]> {
    const userId = req.user.id;

    const tipgroups: Tipgroup[] = await this.tipgroupService.getTipGroupsByUserId(userId);

    return tipgroups.map((group) => ({ name: group.name, id: group.id }));
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
}
