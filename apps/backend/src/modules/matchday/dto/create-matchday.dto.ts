import {CreateMatchDto} from "../../match/dto/create-match.dto";

export class CreateMatchdayDto {
  name: string;
  api_groupId: string;
  matches: CreateMatchDto[];
}
