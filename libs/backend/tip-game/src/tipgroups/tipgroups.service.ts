import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateTipgroupDto,
  ErrorCodes,
  GroupResponse,
  MatchApiResponse,
  Tipgroup,
  TipgroupUser,
  TipSeason,
} from '@tippapp/shared/data-access';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ApiService } from '@tippapp/backend/api';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { UserService } from '@tippapp/backend/user';
import { HashService } from '@tippapp/backend/shared';
import { TipSeasonService } from '../tipseason';

@Injectable()
export class TipgroupsService {
  constructor(
    @InjectRepository(Tipgroup)
    private tipgroupRepository: Repository<Tipgroup>,
    private apiService: ApiService,
    private userService: UserService,
    private tipSeasonService: TipSeasonService,
    private hashService: HashService,
    private errorManager: ErrorManagerService
  ) {}

  async createTipgroup(createTipgroupDto: CreateTipgroupDto, userId: number): Promise<Tipgroup> {
    const entityManager = this.tipgroupRepository.manager;
    return await entityManager.transaction(async (transactionalEntityManager) => {
      // validate Tipgroup Name
      await this.validateTipgroupName(createTipgroupDto.name, transactionalEntityManager);

      // Get User
      const user = await this.userService.findById(userId, transactionalEntityManager);

      if (!user) {
        throw this.errorManager.createError(ErrorCodes.User.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // validate LeagueShortcut
      await this.validateAndGetAvailableLeagues(createTipgroupDto.leagueShortcut);

      // get Api MatchData
      const matchDays: GroupResponse[] = await this.apiService.getAvailableGroups(
        createTipgroupDto.leagueShortcut,
        createTipgroupDto.currentSeason
      );
      const matches: MatchApiResponse[] = await this.apiService.getMatchDataOfSeason(
        createTipgroupDto.leagueShortcut,
        createTipgroupDto.currentSeason
      );

      // create TipgroupUser as admin
      const tipgroupUser = transactionalEntityManager.create(TipgroupUser, {
        user,
        isAdmin: true,
      });

      // create TipSeason with Matchdays and Matches
      const tipSeason: TipSeason = this.tipSeasonService.createTipSeason(
        createTipgroupDto.currentSeason,
        matchDays,
        matches,
        transactionalEntityManager
      );

      // create Tipgroup and set relations
      const tipgroup = transactionalEntityManager.create(Tipgroup, {
        name: createTipgroupDto.name,
        passwordHash: await this.hashService.hashPassword(createTipgroupDto.password),
        users: [tipgroupUser],
        seasons: [tipSeason],
      });

      // save Tipgroup and TipSeason
      return await transactionalEntityManager.save(Tipgroup, tipgroup);
    });
  }

  private async validateAndGetAvailableLeagues(leagueShortcut: string): Promise<void> {
    const availableLeagues = (await this.apiService.getAvailableLeagues()).map((league) => league.leagueShortcut);
    if (!availableLeagues.includes(leagueShortcut)) {
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.LEAGUE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  protected async validateTipgroupName(name: string, entityManager: EntityManager): Promise<void> {
    const existingTipgroup = await entityManager.findOne(Tipgroup, {
      where: { name },
    });
    if (existingTipgroup) {
      throw this.errorManager.createError(ErrorCodes.CreateTipgroup.TIPGROUP_NAME_TAKEN, HttpStatus.CONFLICT);
    }
  }
}
