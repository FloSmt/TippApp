export class MatchResultResponse {
  resultId: number;
  resultName: string;
  pointsTeam1: number | null;
  pointsTeam2: number | null;
  resultOrderId: number;
  resultTypeId: number;

  constructor(data: any) {
    this.resultId = data.resultID ?? data.ResultID;
    this.resultName = data.resultName ?? data.ResultName;
    this.pointsTeam1 = data.pointsTeam1 ?? data.PointsTeam1;
    this.pointsTeam2 = data.pointsTeam2 ?? data.PointsTeam2;
    this.resultOrderId = data.resultOrderID ?? data.ResultOrderID;
    this.resultTypeId = data.resultTypeID ?? data.ResultTypeID;
  }
}
