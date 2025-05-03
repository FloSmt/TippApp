import {Controller, Get, Request} from '@nestjs/common';
import {UserService} from "./user.service";
import {TipgroupResponseDto} from "../tipgroup/dto/tipgroup-response.dto";
import {TipgroupService} from "../tipgroup/tipgroup.service";
import {Tipgroup} from "../../database/entities/tipgroup.entity";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller('user')
export class UserController {

  constructor(private userService: UserService, private tipgroupService: TipgroupService) {
  }


  @Get('tipgroups')
  @ApiBearerAuth()
  async getTipgroups(@Request() req: any): Promise<TipgroupResponseDto[]> {
    const userId = req.user.sub;

    const tipgroups: Tipgroup[] = await this.tipgroupService.getByUserId(userId);

    return tipgroups.map(group => ({name: group.name, id: group.id}));
  }
}
