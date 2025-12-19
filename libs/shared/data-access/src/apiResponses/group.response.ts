export class GroupResponse {
  groupName: string;
  groupOrderId: number;
  groupId: number;
  leagueShortcut: string;

  constructor(data: any) {
    this.groupId = data.groupID;
    this.groupName = data.groupName;
    this.groupOrderId = data.groupOrderID;
    this.leagueShortcut = data.leagueShortcut;
  }
}
