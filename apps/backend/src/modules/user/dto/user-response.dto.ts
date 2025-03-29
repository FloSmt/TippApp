import {OmitType} from "@nestjs/swagger";
import {User} from "../../../database/entities/user.entity";

export class UserResponseDto extends OmitType(User, ['id', 'email', 'username'] as const) {}
