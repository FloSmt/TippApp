import {Body, Controller, HttpCode, HttpStatus, Post, Request} from '@nestjs/common';
import {TipgroupService} from './tipgroup.service';
import {CreateTipgroupDto, TipgroupResponseDto,} from '@tippapp/shared/data-access';
import {ApiBearerAuth, ApiOkResponse, ApiOperation} from '@nestjs/swagger';

@Controller('tipgroup')
export class TipgroupController {
  constructor(private readonly tipgroupService: TipgroupService) {}

  @Post('create')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: TipgroupResponseDto,
  })
  @ApiOperation({
    summary:
      'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches',
  })
  async create(
    @Body() createTipgroupDto: CreateTipgroupDto,
    @Request() req: any
  ): Promise<TipgroupResponseDto> {
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
}
