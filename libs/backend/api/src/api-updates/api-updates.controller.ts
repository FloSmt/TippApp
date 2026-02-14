import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { MatchApiResponse, SupportedLeagueShortcuts } from '@tippapp/shared/data-access';

@Controller('api-updates')
export class ApiUpdatesController {
  @MessagePattern('openligadb/#')
  async handleApiUpdate(@Payload() payload: any, @Ctx() context: any) {
    console.log('Received API update event for OpenLigaDB');

    try {
      const result = new MatchApiResponse(JSON.parse(JSON.stringify(payload)));

      if (result.leagueShortcut && SupportedLeagueShortcuts.includes(result.leagueShortcut)) {
        console.log(`API update for league: ${result.leagueShortcut}, match ID: ${result.matchId}`);
        console.log('------------------------------------------');
        console.log(result);
        console.log('------------------------------------------');
      }
    } catch (err) {
      console.error('Error processing API update event:', err);
    }
  }
}
