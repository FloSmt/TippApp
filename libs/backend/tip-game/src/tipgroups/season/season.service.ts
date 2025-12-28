import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ErrorCodes,
  GroupResponse,
  Match,
  MatchApiResponse,
  Matchday,
  MatchdayDetailsResponseDto,
  MatchdayOverviewResponseDto,
  TipSeason,
} from '@tippapp/shared/data-access';
import { EntityManager } from 'typeorm';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { SeasonRepository } from '@tippapp/backend/shared';
import { MatchdayService } from '../matchday/matchday.service';

@Injectable()
export class SeasonService {
  constructor(
    private readonly seasonRepository: SeasonRepository,
    private readonly errorManager: ErrorManagerService,
    private readonly matchdayService: MatchdayService
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
  createTipSeason(
    season: number,
    leagueShortcut: string,
    matchDays: GroupResponse[],
    matches: MatchApiResponse[],
    entityManager: EntityManager
  ): TipSeason {
    return entityManager.create(TipSeason, {
      api_LeagueSeason: season,
      isClosed: false,
      matchdays: matchDays.map((group) =>
        entityManager.create(Matchday, {
          name: group.groupName,
          api_groupOrderId: group.groupOrderId,
          orderId: group.groupOrderId,
          api_leagueShortcut: leagueShortcut,
          matches: matches
            .filter((m) => m.group.groupId === group.groupId)
            .map((match) =>
              entityManager.create(Match, {
                api_matchId: match.matchId,
              })
            ),
        })
      ),
    });
  }

  /**
   * Retrieves all matchdays for a given tipgroup and season.
   *
   * @param tipgroupId
   * @param seasonId
   * @returns A promise that resolves to an array of MatchdayOverviewResponseDto objects.
   */
  async getAllMatchdays(
    tipgroupId: number,
    seasonId: number | null | undefined
  ): Promise<MatchdayOverviewResponseDto[]> {
    if (!seasonId || !Number.isInteger(Number(seasonId))) {
      throw this.errorManager.createError(ErrorCodes.Tipgroup.SEASON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return this.seasonRepository.getAllMatchdays(tipgroupId, seasonId);
  }

  async getCurrentMatchday(
    tipgroupId: number,
    seasonId: number | null | undefined
  ): Promise<MatchdayDetailsResponseDto> {
    if (!seasonId || !Number.isInteger(Number(seasonId))) {
      throw this.errorManager.createError(ErrorCodes.Tipgroup.SEASON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Now it returns the first Matchday. Later it will be returning a calculated Matchday.
    const allMatchdays = await this.seasonRepository.getAllMatchdays(tipgroupId, seasonId);

    return this.matchdayService.getMatchdayDetails(tipgroupId, seasonId, allMatchdays[0].matchdayId);
  }
}
