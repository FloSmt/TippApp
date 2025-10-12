import { Injectable } from '@nestjs/common';
import {
  GroupResponse,
  Match,
  Matchday,
  MatchResponse,
  TipSeason,
} from '@tippapp/shared/data-access';
import { EntityManager } from 'typeorm';

@Injectable()
export class TipSeasonService {
  createTipSeason(
    season: number,
    matchDays: GroupResponse[],
    matches: MatchResponse[],
    entityManager: EntityManager
  ): TipSeason {
    return entityManager.create(TipSeason, {
      api_LeagueSeason: season,
      isClosed: false,
      matchdays: matchDays.map((group) =>
        entityManager.create(Matchday, {
          name: group.groupName,
          api_groupId: group.groupId,
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
