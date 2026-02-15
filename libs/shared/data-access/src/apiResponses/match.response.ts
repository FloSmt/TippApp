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
  lastUpdateDateTime: string;
  group: GroupResponse;
  team1: TeamResponse;
  team2: TeamResponse;
  matchIsFinished: boolean;
  matchResults: MatchResultResponse[];

  constructor(data: any) {
    this.matchId = data.matchID ?? data.MatchID;
    this.matchDateTime = data.matchDateTime ?? data.MatchDateTime;
    this.timeZoneId = data.timeZoneID ?? data.TimeZoneID;
    this.leagueId = data.leagueId ?? data.LeagueId;
    this.leagueName = data.leagueName ?? data.LeagueName;
    this.leagueSeason = data.leagueSeason ?? data.LeagueSeason;
    this.leagueShortcut = data.leagueShortcut ?? data.LeagueShortcut;
    this.matchDateTimeUTC = data.matchDateTimeUTC ?? data.MatchDateTimeUTC;
    this.group = new GroupResponse(data.group ?? data.Group);
    this.team1 = new TeamResponse(data.team1 ?? data.Team1);
    this.team2 = new TeamResponse(data.team2 ?? data.Team2);
    this.matchIsFinished = data.matchIsFinished ?? data.MatchIsFinished;
    this.lastUpdateDateTime = data.lastUpdateDateTime ?? data.LastUpdateDateTime;

    const matchResultsData = data.matchResults ?? data.MatchResults;
    this.matchResults = matchResultsData.map((matchResult: any) => new MatchResultResponse(matchResult)) || null;
  }
}
