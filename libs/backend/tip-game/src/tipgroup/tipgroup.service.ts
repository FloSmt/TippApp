import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTipgroupDto,
  GroupResponse,
  MatchResponse,
} from '@tippapp/shared/data-access';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipgroup, TipgroupUser, User } from '@tippapp/backend/database';
import { ApiService } from '@tippapp/backend/api';
import { UserService } from '@tippapp/backend/user';
import { TipSeasonService } from '../tipseason';

@Injectable()
export class TipgroupService {
  constructor(
    @InjectRepository(Tipgroup)
    private tipgroupRepository: Repository<Tipgroup>,
    private TipSeasonService: TipSeasonService,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  async createTipgroup(
    createTipgroupDto: CreateTipgroupDto,
    userId: number
  ): Promise<Tipgroup> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User was not found');
    }

    await this.validateAndGetAvailableLeagues(createTipgroupDto.leagueShortcut);

    const { matchDays, matches } = await this.getApiMatchData(
      createTipgroupDto.leagueShortcut,
      createTipgroupDto.currentSeason
    );

    if (matchDays && matches) {
      const newTipgroup = this.createNewTipgroupEntity(
        createTipgroupDto.name,
        createTipgroupDto.passwordHash
      );

      // Add User as Admin to Tipgroup
      const newTipgroupUser = this.createNewTipgroupUserAsAdmin(user);
      newTipgroup.users.push(newTipgroupUser);

      // Add first Season to Tipgroup
      const newTipSeason = this.TipSeasonService.createNewTipSeason({
        api_LeagueSeason: createTipgroupDto.currentSeason,
        isClosed: false,
        matchdays: matchDays.map((group) => {
          const matchesForGroup = matches.filter(
            (match) => match.group.groupId === group.groupId
          );
          return {
            name: group.groupName,
            api_groupId: group.groupId,
            matches: matchesForGroup.map((match) => ({
              api_matchId: match.matchId,
            })),
          };
        }),
      });

      // Save new TipSeason
      const savedTipSeason = await this.TipSeasonService.saveTipSeason(
        newTipSeason
      );
      newTipgroup.seasons.push(savedTipSeason);

      return this.tipgroupRepository.save(newTipgroup);
    }

    throw new InternalServerErrorException();
  }

  private async validateAndGetAvailableLeagues(
    leagueShortcut: string
  ): Promise<void> {
    const availableLeagues = (await this.apiService.getAvailableLeagues()).map(
      (league) => league.leagueShortcut
    );
    if (!availableLeagues.includes(leagueShortcut)) {
      throw new NotFoundException('LeagueShortcut was not found');
    }
  }

  private async getApiMatchData(
    leagueShortcut: string,
    currentSeason: number
  ): Promise<{ matchDays: GroupResponse[]; matches: MatchResponse[] }> {
    const matchDaysFromApi: GroupResponse[] =
      await this.apiService.getAvailableGroups(leagueShortcut, currentSeason);
    const matchesFromApi: MatchResponse[] = await this.apiService.getMatchData(
      leagueShortcut,
      currentSeason
    );

    if (!matchDaysFromApi || !matchesFromApi) {
      throw new InternalServerErrorException(
        'Failed to retrieve match data from external API.'
      );
    }
    return { matchDays: matchDaysFromApi, matches: matchesFromApi };
  }

  private createNewTipgroupEntity(
    name: string,
    passwordHash?: string
  ): Tipgroup {
    const newTipgroup = this.tipgroupRepository.create({ name, passwordHash });
    newTipgroup.users = [];
    newTipgroup.seasons = [];
    return newTipgroup;
  }

  private createNewTipgroupUserAsAdmin(user: User): TipgroupUser {
    const newTipgroupUser = new TipgroupUser();
    newTipgroupUser.isAdmin = true;
    newTipgroupUser.user = user;
    return newTipgroupUser;
  }
}
