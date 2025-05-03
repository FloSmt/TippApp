import {
  Controller,
} from '@nestjs/common';
import { MatchdayService } from './matchday.service';

@Controller('matchday')
export class MatchdayController {
  constructor(private readonly matchdayService: MatchdayService) {}
}
