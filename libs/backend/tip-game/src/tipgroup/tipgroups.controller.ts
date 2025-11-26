import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import {
  ApiErrorDto,
  AvailableLeagueResponseDto,
  CreateTipgroupDto,
  ErrorCodes,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiService } from '@tippapp/backend/api';
import { TipgroupService } from './tipgroup.service';

@Controller('tipgroups')
export class TipgroupsController {
  constructor(private readonly tipgroupService: TipgroupService, private readonly apiService: ApiService) {}

  @Post('create')
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

  @Get('getAvailableLeagues')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AvailableLeagueResponseDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'responses a list of available leagues for creating a new tipgroup',
  })
  async getAvailableLeagues(): Promise<AvailableLeagueResponseDto[]> {
    return this.apiService.getAvailableLeagues();
  }
}
