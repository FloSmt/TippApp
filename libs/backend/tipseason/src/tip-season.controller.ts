import { Controller } from '@nestjs/common';
import { TipSeasonService } from './tip-season.service';

@Controller('tip-season')
export class TipSeasonController {
  constructor(private readonly tipSeasonService: TipSeasonService) {}
}
