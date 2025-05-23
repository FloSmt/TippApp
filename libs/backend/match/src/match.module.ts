import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';

@Module({
  controllers: [MatchController],
  exports: [MatchService],
  providers: [MatchService],
})
export class MatchModule {}
