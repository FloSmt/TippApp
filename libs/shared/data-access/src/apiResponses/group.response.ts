export class GroupResponse {
  groupName: string;
  groupOrderId: number;
  groupId: number;

  constructor(data: any) {
    this.groupId = data.groupID;
    this.groupName = data.groupName;
    this.groupOrderId = data.groupOrderID;
  }
}
