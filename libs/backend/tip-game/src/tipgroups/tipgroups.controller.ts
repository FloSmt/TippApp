import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import {
  ApiErrorDto,
  CreateTipgroupDto,
  ErrorCodes,
  LeagueOverviewResponseDto,
  Tipgroup,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiService } from '@tippapp/backend/api';
import { TipgroupsService } from './tipgroups.service';

@Controller('tipgroups')
export class TipgroupsController {
  constructor(private readonly tipgroupService: TipgroupsService, private readonly apiService: ApiService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: TipgroupEntryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tipgroup name already exists',
    type: ApiErrorDto,
    example: ErrorCodes.CreateTipgroup.TIPGROUP_NAME_TAKEN,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User who creates the Tipgroup not found',
    type: ApiErrorDto,
    example: ErrorCodes.User.USER_NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'referenced League not found',
    type: ApiErrorDto,
    example: ErrorCodes.CreateTipgroup.LEAGUE_NOT_FOUND,
  })
  @ApiOperation({
    summary: 'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches',
  })
  async create(@Body() createTipgroupDto: CreateTipgroupDto, @Request() req: any): Promise<TipgroupEntryResponseDto> {
    const userId = req.user.id;
    const tipgroup = await this.tipgroupService.createTipgroup(createTipgroupDto, userId);

    return {
      id: tipgroup.id,
      name: tipgroup.name,
    };
  }

  @Get()
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

    const tipgroups: Tipgroup[] = await this.tipgroupService.getTipGroupsByUserId(userId);

    return tipgroups.map((group) => ({ name: group.name, id: group.id }));
  }

  @Get('getAvailableLeagues')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeagueOverviewResponseDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'responses a list of available leagues for creating a new matchday',
  })
  async getAvailableLeagues(): Promise<LeagueOverviewResponseDto[]> {
    return this.apiService.getAvailableLeagues();
  }
}
