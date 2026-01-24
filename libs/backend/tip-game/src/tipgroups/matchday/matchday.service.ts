import { HttpStatus, Injectable } from '@nestjs/common';
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
import { mapApiMatchResponsesToMatchDayResponseDto } from '../../helper/responses-mapper';

@Injectable()
export class MatchdayService {
  constructor(
    private readonly apiService: ApiService,
    private readonly errorManager: ErrorManagerService,
    private readonly matchdayRepository: MatchdayRepository,
    private readonly matchRepository: MatchRepository
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

  async createMatchdayEntity(
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

    const matches: Match[] = matchResponse
      .filter((m) => m.group.groupId === group.groupId)
      .map((match) => {
        const matchEntity: Match = new Match();
        matchEntity.api_matchId = match.matchId;

        return matchEntity;
      });

    await entityManager.upsert(Match, matches, { conflictPaths: ['api_matchId'] });
    const savedMatches = await this.matchRepository.findAllByApiMatchId(
      matches.map((m) => m.api_matchId),
      entityManager
    );

    matchday.matches = savedMatches ?? [];

    return matchday;
  }
}
