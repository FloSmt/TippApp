export class MatchResultResponse {
  resultId: number;
  resultName: string;
  pointsTeam1: number;
  pointsTeam2: number;
  resultOrderId: number;
  resultTypeId: number;

  constructor(data: any) {
    this.resultId = data.resultID;
    this.resultName = data.resultName;
    this.pointsTeam1 = data.pointsTeam1;
    this.pointsTeam2 = data.pointsTeam2;
    this.resultOrderId = data.resultOrderID;
    this.resultTypeId = data.resultTypeID;
  }
}
