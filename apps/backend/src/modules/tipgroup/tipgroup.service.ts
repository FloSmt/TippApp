import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateTipgroupDto } from './dto/create-tipgroup.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Tipgroup} from "../../database/entities/tipgroup.entity";
import {TipSeasonService} from "../tip-season/tip-season.service";
import {ApiService} from "../../api/api.service";
import {GroupResponse} from "../../api/responses/group.response";
import {MatchResponse} from "../../api/responses/match.response";
import {UserService} from "../user/user.service";
import {TipgroupUser} from "../../database/entities/tipgroupUser.entity";

@Injectable()
export class TipgroupService {

  constructor(
    @InjectRepository(Tipgroup) private tipgroupRepository: Repository<Tipgroup>,
    private TipSeasonService: TipSeasonService,
    private apiService: ApiService,
    private userService: UserService
    ) {
  }

  async create(createTipgroupDto: CreateTipgroupDto, userId: number): Promise<Tipgroup> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    // Get all Groups from API for given League and Season
    const matchDaysFromApi: GroupResponse[] = await this.apiService.getAvailableGroups(createTipgroupDto.leagueShortcut, createTipgroupDto.currentSeason);

    // Get all Matches from API for given League and Season
    const matchesFromApi: MatchResponse[] = await this.apiService.getMatchDay(createTipgroupDto.leagueShortcut, createTipgroupDto.currentSeason);

    if (matchDaysFromApi && matchesFromApi) {
      const newTipgroup = this.tipgroupRepository.create({
        name: createTipgroupDto.name,
        passwordHash: createTipgroupDto.passwordHash,
      });
      newTipgroup.users = [];

      // Add User as Admin to Tipgroup
      const newTipgroupUser = new TipgroupUser();
      newTipgroupUser.isAdmin = true;
      newTipgroupUser.user = user;
      newTipgroup.users.push(newTipgroupUser);

      // Add first Season to Tipgroup
      newTipgroup.seasons = [];
      const newTipSeason = this.TipSeasonService.createNewTipSeason({
        api_LeagueSeason: createTipgroupDto.currentSeason,
        isClosed: false,
        matchdays: matchDaysFromApi.map(group => {
          const matchesForGroup = matchesFromApi.filter(match => match.group.groupId === group.groupId);
          return {
            name: group.groupName,
            api_groupId: group.groupId,
            matches: matchesForGroup.map(match => ({
              api_matchId: match.matchId
            }))
          };
        })
      });

      // Save new TipSeason
      const savedTipSeason = await this.TipSeasonService.saveTipSeason(newTipSeason);
      newTipgroup.seasons.push(savedTipSeason);

      return this.tipgroupRepository.save(newTipgroup);
    }

    return null;
  }
}
