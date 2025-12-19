import { HttpStatus, Injectable } from '@nestjs/common';
import { ErrorCodes, MatchApiResponse, MatchdayResponseDto } from '@tippapp/shared/data-access';
import { ApiService } from '@tippapp/backend/api';
import { ErrorManagerService } from '@tippapp/backend/error-handling';
import { mapApiMatchResponsesToMatchDayResponseDto } from '../../helper/responses-mapper';
import { QueriesService } from '../../queries/queries.service';

@Injectable()
export class TipgroupService {
  constructor(
    private apiService: ApiService,
    private errorManager: ErrorManagerService,
    private queryService: QueriesService
  ) {}

  public async getMatchdayDetails(
    tipgroupId: number,
    seasonId: number,
    matchdayId: number
  ): Promise<MatchdayResponseDto> {
    const matchdayFromDb = await this.queryService.getMatchdayFromDb(tipgroupId, seasonId, matchdayId);

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
      matchdayId: matchdayId,
      league: {
        leagueId: matchData[0]?.leagueId || 0,
        leagueName: matchData[0]?.leagueName || '',
        leagueSeason: matchdayFromDb?.matchday.api_leagueSeason || 0,
        leagueShortcut: matchdayFromDb?.matchday.api_leagueShortcut || '',
      },
      matches: mapApiMatchResponsesToMatchDayResponseDto(filteredMatchData),
    } satisfies MatchdayResponseDto;
  }
}
