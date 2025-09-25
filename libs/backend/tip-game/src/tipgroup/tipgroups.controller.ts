import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import {
  AvailableLeagueResponseDto,
  CreateTipgroupDto,
  TipgroupEntryResponseDto,
} from '@tippapp/shared/data-access';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TipgroupService } from './tipgroup.service';

@Controller('tipgroups')
export class TipgroupsController {
  constructor(private readonly tipgroupService: TipgroupService) {}

  @Post('create')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: TipgroupEntryResponseDto,
  })
  @ApiOperation({
    summary:
      'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches',
  })
  async create(
    @Body() createTipgroupDto: CreateTipgroupDto,
    @Request() req: any
  ): Promise<TipgroupEntryResponseDto> {
    const userId = req.user.id;
    const tipgroup = await this.tipgroupService.createTipgroup(
      createTipgroupDto,
      userId
    );

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
    summary:
      'responses a list of available leagues for creating a new tipgroup',
  })
  async getAvailableLeagues(): Promise<AvailableLeagueResponseDto[]> {
    console.log('GET /tipgroups/getAvailableLeagues called');
    return this.tipgroupService.getAvailableLeagues();
  }
}
