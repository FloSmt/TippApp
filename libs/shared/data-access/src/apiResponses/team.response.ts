export class TeamResponse {
  teamId: number;
  teamName: string;
  shortName: string;
  teamIconUrl: string;

  constructor(data: any) {
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.shortName = data.shortName;
    this.teamIconUrl = data.teamIconUrl;
  }
}
