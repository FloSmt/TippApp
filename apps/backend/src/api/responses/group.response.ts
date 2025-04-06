export class GroupResponse {
  groupName: string;
  groupOrderId: string;
  groupId: string;

  constructor(data: any) {
    this.groupId = data.groupID;
    this.groupName = data.groupName;
    this.groupOrderId = data.groupOrderID;
  }
}
