import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTipgroupDto } from '@tippapp/shared/data-access';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipgroup, TipgroupUser } from '@tippapp/backend/database';
import { ApiService } from '@tippapp/backend/api';
import { UserService } from '@tippapp/backend/user';

@Injectable()
export class TipgroupService {
  constructor(
    @InjectRepository(Tipgroup)
    private tipgroupRepository: Repository<Tipgroup>,
    @InjectRepository(TipgroupUser)
    private readonly tipgroupUserRepository: Repository<TipgroupUser>,
    private TipSeasonService: TipSeasonService,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  async create(
    createTipgroupDto: CreateTipgroupDto,
    userId: number
  ): Promise<Tipgroup> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    // Get all Groups from API for given League and Season
    const matchDaysFromApi: GroupResponse[] =
      await this.apiService.getAvailableGroups(
        createTipgroupDto.leagueShortcut,
        createTipgroupDto.currentSeason
      );

    // Get all Matches from API for given League and Season
    const matchesFromApi: MatchResponse[] = await this.apiService.getMatchDay(
      createTipgroupDto.leagueShortcut,
      createTipgroupDto.currentSeason
    );

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
        matchdays: matchDaysFromApi.map((group) => {
          const matchesForGroup = matchesFromApi.filter(
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

  async getByUserId(userId: number): Promise<Tipgroup[]> {
    const tipgroupUserEntries = await this.tipgroupUserRepository.find({
      where: { userId: userId },
      relations: ['tipgroup'],
    });

    return tipgroupUserEntries.map((entry) => entry.tipgroup);
  }
}
