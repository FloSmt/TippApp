export class TeamResponse {
  teamId: number;
  teamName: string;
  shortName: string;
  teamIconUrl: string;

  constructor(data: any) {
    this.teamId = data.teamId ?? data.TeamId;
    this.teamName = data.teamName ?? data.TeamName;
    this.shortName = data.shortName ?? data.ShortName;
    this.teamIconUrl = data.teamIconUrl ?? data.TeamIconUrl;
  }
}
