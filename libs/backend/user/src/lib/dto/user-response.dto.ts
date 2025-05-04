import {OmitType} from "@nestjs/swagger";
import {User} from "@tippapp/backend/database";

export class UserResponseDto extends OmitType(User, ['id', 'email', 'username'] as const) {}
