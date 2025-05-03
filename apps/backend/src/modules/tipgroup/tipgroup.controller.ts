import {Controller, Post, Body, Request} from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { CreateTipgroupDto } from './dto/create-tipgroup.dto';
import {ApiOkResponse, ApiOperation} from "@nestjs/swagger";
import {TipgroupResponseDto} from "./dto/tipgroup-response.dto";

@Controller('tipgroup')
export class TipgroupController {
  constructor(private readonly tipgroupService: TipgroupService) {}

  @Post('create')
  @ApiOkResponse({
    type: TipgroupResponseDto
  })
  @ApiOperation({summary: 'creates a new Tipgroup and generates a new TipSeason with all given Matchdays and Matches'})
  async create(@Body() createTipgroupDto: CreateTipgroupDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.tipgroupService.create(createTipgroupDto, userId);
  }
}
