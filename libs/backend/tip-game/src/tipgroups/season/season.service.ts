import { Injectable } from '@nestjs/common';
import { GroupResponse, Match, MatchApiResponse, Matchday, TipSeason } from '@tippapp/shared/data-access';
import { EntityManager } from 'typeorm';

@Injectable()
export class SeasonService {
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
}
