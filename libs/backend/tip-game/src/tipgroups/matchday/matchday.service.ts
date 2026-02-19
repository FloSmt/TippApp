import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  ErrorCodes,
  GroupResponse,
  Match,
  MatchApiResponse,
  Matchday,
  MatchdayDetailsResponseDto,
} from '@tippapp/shared/data-access';
import { ApiService } from '@tippapp/backend/api';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { MatchdayRepository, MatchRepository } from '@tippapp/backend/shared';
import { EntityManager } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  mapApiMatchResponsesToMatchDayResponseDto,
  mapApiMatchResponseToMatchEntity,
} from '../../helper/responses-mapper';
import { MatchService } from '../match/match.service';

@Injectable()
export class MatchdayService {
  constructor(
    private readonly apiService: ApiService,
    private readonly errorManager: ErrorManagerService,
    private readonly matchdayRepository: MatchdayRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchService: MatchService
  ) {}

  public async getMatchdayDetails(
    tipgroupId: number,
    seasonId: number,
    matchdayId: number
  ): Promise<MatchdayDetailsResponseDto> {
    const matchdayFromDb = await this.matchdayRepository.getMatchdayFromDb(tipgroupId, seasonId, matchdayId);

    if (
      !matchdayFromDb ||
      !matchdayFromDb.matchday ||
      matchdayFromDb.matchday.matches.length === 0 ||
      !matchdayFromDb.matchday.api_leagueShortcut ||
      !matchdayFromDb.matchday.api_leagueSeason ||
      !matchdayFromDb.matchday.api_groupOrderId
    ) {
      throw this.errorManager.createError(ErrorCodes.Tipgroup.MATCHDAY_DETAILS_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const matchData: MatchApiResponse[] = await this.apiService.getMatchData(
      matchdayFromDb?.matchday.api_leagueShortcut || '',
      matchdayFromDb?.matchday.api_leagueSeason || 0,
      matchdayFromDb?.matchday.api_groupOrderId || 0
    );

    await this.matchService.updateMatchObjects(matchData);

    const matchIds = new Set(matchdayFromDb?.matchday.matches.map((m) => (m.api_matchId ?? '').toString().trim()));
    const filteredMatchData = matchData.filter((match) => matchIds.has(match.matchId.toString().trim()));

    return {
      orderId: matchdayFromDb?.matchday.orderId || 0,
      name: matchdayFromDb?.matchday.name || '',
      matchCount: matchdayFromDb?.matchday.matches.length || 0,
      matchdayId: Number(matchdayId),
      league: {
        leagueId: matchData[0]?.leagueId || 0,
        leagueName: matchData[0]?.leagueName || '',
        leagueSeason: matchdayFromDb?.matchday.api_leagueSeason || 0,
        leagueShortcut: matchdayFromDb?.matchday.api_leagueShortcut || '',
      },
      matchList: mapApiMatchResponsesToMatchDayResponseDto(filteredMatchData),
    } satisfies MatchdayDetailsResponseDto;
  }

  /**
   * Generates a Matchday entity based on the provided GroupResponse and MatchApiResponse data.
   * This method is typically used when creating or updating a TipSeason,
   * where matchdays need to be generated based on API data.
   * @param group - The GroupResponse object containing information about the matchday group.
   * @param matchResponse - An array of MatchApiResponse objects containing match data for the season.
   * @param leagueShortcut - The shortcut identifier for the league, used to associate the matchday with the correct league.
   * @param entityManager - The TypeORM EntityManager for database operations
   * @return A Promise that resolves to a Matchday entity populated with the relevant matches based on the provided API data.
   */
  async generateMatchday(
    group: GroupResponse,
    matchResponse: MatchApiResponse[],
    leagueShortcut: string,
    entityManager: EntityManager
  ) {
    const matchday = new Matchday();

    matchday.name = group.groupName;
    matchday.api_groupOrderId = group.groupOrderId;
    matchday.orderId = group.groupOrderId;
    matchday.api_leagueShortcut = leagueShortcut;

    const apiMatchesData = matchResponse.filter((m) => m.group.groupId === group.groupId);

    return this.fillMatchdayWithMatches(matchday, apiMatchesData, entityManager);
  }

  /**
   * Updates an existing Match entity with new data from a MatchApiResponse.
   * This method is used to ensure that the Match entity in the database
   * @param entity - The existing Match entity that needs to be updated with new data.
   * @param apiData - The MatchApiResponse object containing the latest data for the match, typically retrieved from an external API.
   * @return A new Match entity that combines the existing data with the updated data from the API response.
   * The method uses object spread syntax to create a new object that merges the properties of the existing entity with the new data mapped from the API response.
   */
  updateMatchEntity(entity: Match, apiData: MatchApiResponse): Match {
    return { ...entity, ...mapApiMatchResponseToMatchEntity(apiData) };
  }

  private async fillMatchdayWithMatches(
    matchday: Matchday,
    matches: MatchApiResponse[],
    entityManager: EntityManager
  ): Promise<Matchday> {
    const savedMatches =
      (await this.matchRepository.findAllByApiMatchId(
        matches.map((m) => m.matchId),
        entityManager
      )) ?? [];

    const savedMatchesMap = new Map(savedMatches.map((m) => [m.api_matchId, m]));

    matchday.matches = matches.map((apiData) => {
      const existingMatch = savedMatchesMap.get(apiData.matchId);

      if (existingMatch) {
        return this.updateMatchEntity(existingMatch, apiData);
      } else {
        return mapApiMatchResponseToMatchEntity(apiData);
      }
    });
    return matchday;
  }

  /**
   * Handler for the 'matchday.recalculate' event. This method is triggered when a matchday needs to be recalculated,
   * typically after a match's results have been updated.
   */
  @OnEvent('matchday.recalculate', { async: true })
  async handleMatchdayRecalculation(payload: { matchId: number }) {
    Logger.log("Received event 'matchday.recalculate' for matchId: " + payload.matchId, 'MatchdayService');
    await this.matchdayRepository.recalculateMatchdayStats(payload.matchId);
  }
}
