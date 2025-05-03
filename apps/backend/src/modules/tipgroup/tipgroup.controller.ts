import {Controller, Post, Body, Request} from '@nestjs/common';
import { TipgroupService } from './tipgroup.service';
import { CreateTipgroupDto } from './dto/create-tipgroup.dto';

@Controller('tipgroup')
export class TipgroupController {
  constructor(private readonly tipgroupService: TipgroupService) {}

  @Post()
  async create(@Body() createTipgroupDto: CreateTipgroupDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.tipgroupService.create(createTipgroupDto, userId);
  }
}
