import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import {
  ErrorCodes,
  GroupResponse,
  MatchApiResponse,
  MatchdayDetailsResponseDto,
  MatchdayListResponseDto,
  TipSeason,
} from '@tippapp/shared/data-access';
import { EntityManager } from 'typeorm';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { SeasonRepository } from '@tippapp/backend/shared';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheManagerStore } from 'cache-manager';
import { MatchdayService } from '../matchday/matchday.service';

@Injectable()
export class SeasonService {
  constructor(
    private readonly seasonRepository: SeasonRepository,
    private readonly errorManager: ErrorManagerService,
    private readonly matchdayService: MatchdayService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManagerStore
  ) {}

  /**
   * Creates a TipSeason entity with associated Matchdays and Matches.
   *
   * @param season - The season year (e.g., 2023).
   * @param leagueShortcut - The shortcut identifier for the league.
   * @param matchDays - An array of GroupResponse objects representing match days.
   * @param matches - An array of MatchApiResponse objects representing matches.
   * @param entityManager - The TypeORM EntityManager for database operations.
   * @returns A TipSeason entity populated with Matchdays and Matches.
   */
  async createTipSeason(
    season: number,
    leagueShortcut: string,
    matchDays: GroupResponse[],
    matches: MatchApiResponse[],
    entityManager: EntityManager
  ): Promise<TipSeason> {
    const tipSeason: TipSeason = new TipSeason();
    tipSeason.api_LeagueSeason = season;
    tipSeason.isClosed = false;

    tipSeason.matchdays = await Promise.all(
      matchDays.map(
        async (group) => await this.matchdayService.generateMatchday(group, matches, leagueShortcut, entityManager)
      )
    );
    return tipSeason;
  }

  /**
   * Retrieves all matchdays for a given tipgroup and season.
   *
   * @param tipgroupId
   * @param seasonId
   * @returns A promise that resolves to an array of MatchdayListResponseDto objects.
   */
  async getAllMatchdays(tipgroupId: number, seasonId: number | null | undefined): Promise<MatchdayListResponseDto> {
    if (!seasonId || !Number.isInteger(Number(seasonId))) {
      throw this.errorManager.createError(ErrorCodes.Tipgroup.SEASON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    Logger.log('Fetching all matchdays for tipgroupId: ' + tipgroupId + ' and seasonId: ' + seasonId, 'SeasonService');

    const matchdayList = await this.seasonRepository.getAllMatchdays(tipgroupId, seasonId);
    const currentMatchdayId = await this.getCurrentMatchdayId(tipgroupId, seasonId);

    return {
      matchdays: matchdayList,
      currentMatchdayId: currentMatchdayId,
    };
  }

  async getCurrentMatchday(
    tipgroupId: number,
    seasonId: number | null | undefined
  ): Promise<MatchdayDetailsResponseDto> {
    if (!seasonId || !Number.isInteger(Number(seasonId))) {
      throw this.errorManager.createError(ErrorCodes.Tipgroup.SEASON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    Logger.log(
      'Fetching current matchday for tipgroupId: ' + tipgroupId + ' and seasonId: ' + seasonId,
      'SeasonService'
    );

    const currentMatchdayId = await this.getCurrentMatchdayId(tipgroupId, seasonId);
    return await this.matchdayService.getMatchdayDetails(tipgroupId, seasonId, currentMatchdayId);
  }

  private async getCurrentMatchdayId(tipgroupId: number, seasonId: number): Promise<number> {
    const cacheKey = `${tipgroupId}_${seasonId}`;
    const cachedMatchdayId = await this.cacheManager.get(cacheKey);

    if (cachedMatchdayId) {
      Logger.debug('Returning cached current matchdayId: ' + cachedMatchdayId, 'SeasonService');
      return cachedMatchdayId;
    }

    const currentMatchday = await this.seasonRepository.getCurrentMatchday(seasonId);
    let matchdayId;

    if (!currentMatchday) {
      Logger.debug('No current matchday found, defaulting to first matchday of the season', 'SeasonService');
      const allMatchdays = await this.seasonRepository.getAllMatchdays(tipgroupId, seasonId);
      matchdayId = allMatchdays[0].matchdayId;
    } else {
      await this.cacheManager.set(cacheKey, currentMatchday.id, 60 * 60); // Cache for 1 hour
      matchdayId = currentMatchday.id;
    }

    Logger.debug('Calculate Current MatchdayId: ' + matchdayId, 'SeasonService');
    return matchdayId;
  }
}
