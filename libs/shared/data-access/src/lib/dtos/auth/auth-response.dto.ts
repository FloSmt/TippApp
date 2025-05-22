import {ApiProperty} from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
