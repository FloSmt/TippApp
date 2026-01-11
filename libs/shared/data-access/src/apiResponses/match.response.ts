import { GroupResponse } from './group.response';
import { MatchResultResponse } from './matchResult.response';
import { TeamResponse } from './team.response';

export class MatchApiResponse {
  matchId: number;
  matchDateTime: string;
  timeZoneId: string;
  leagueId: number;
  leagueName: string;
  leagueSeason: number;
  leagueShortcut: string;
  matchDateTimeUTC: string;
  lastUpdatedDateTime: string;
  group: GroupResponse;
  team1: TeamResponse;
  team2: TeamResponse;
  matchIsFinished: boolean;
  matchResults: MatchResultResponse[];

  constructor(data: any) {
    this.matchId = data.matchID;
    this.matchDateTime = data.matchDateTime;
    this.timeZoneId = data.timeZoneID;
    this.leagueId = data.leagueId;
    this.leagueName = data.leagueName;
    this.leagueSeason = data.leagueSeason;
    this.leagueShortcut = data.leagueShortcut;
    this.matchDateTimeUTC = data.matchDateTimeUTC;
    this.group = new GroupResponse(data.group);
    this.team1 = new TeamResponse(data.team1);
    this.team2 = new TeamResponse(data.team2);
    this.matchIsFinished = data.matchIsFinished;
    this.lastUpdatedDateTime = data.lastUpdatedDateTime;
    this.matchResults = data.matchResults.map((matchResult: any) => new MatchResultResponse(matchResult)) || null;
  }
}
