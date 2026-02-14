import { Injectable, Logger } from '@nestjs/common';
import { MatchApiResponse, SupportedLeagueShortcuts } from '@tippapp/shared/data-access';
import { MatchService } from '../tipgroups';

@Injectable()
export class ApiUpdatesService {
  constructor(private readonly matchService: MatchService) {}

  handleApiUpdate(payload: any) {
    try {
      const result = new MatchApiResponse(JSON.parse(JSON.stringify(payload)));

      if (result.leagueShortcut && SupportedLeagueShortcuts.includes(result.leagueShortcut)) {
        Logger.log('Received API update event for matchId: ' + result.matchId);
        this.matchService.updateMatchObject(result);
      }
    } catch (err) {
      Logger.error('Error processing API update event:', err);
    }
  }
}
