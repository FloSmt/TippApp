export class GroupResponse {
  groupName: string;
  groupOrderId: number;
  groupId: number;

  constructor(data: any) {
    this.groupId = data.groupID ?? data.GroupID;
    this.groupName = data.groupName ?? data.GroupName;
    this.groupOrderId = data.groupOrderID ?? data.GroupOrderID;
  }
}
