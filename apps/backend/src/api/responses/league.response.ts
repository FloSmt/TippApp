export class LeagueResponse {
  leagueId: number;
  sportId: number;
  leagueName: string;
  leagueShortcut: string;
  leagueSeason: number;

  constructor(data: any) {
    this.leagueId = data.leagueId;
    this.sportId = data.sport.sportId;
    this.leagueName = data.leagueName;
    this.leagueShortcut = data.leagueShortcut;
    this.leagueSeason = data.leagueSeason;
  }
}
