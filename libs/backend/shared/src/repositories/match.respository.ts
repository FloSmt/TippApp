import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { Match } from '@tippapp/shared/data-access';

@Injectable()
export class MatchRepository extends Repository<Match> {
  constructor(private dataSource: DataSource) {
    super(Match, dataSource.createEntityManager());
  }

  async findAllByApiMatchId(api_matchId: number[], entityManager?: EntityManager): Promise<Match[] | undefined> {
    if (!api_matchId || api_matchId.length === 0) return [];

    const manager = entityManager || this.dataSource.manager;
    return manager
      .createQueryBuilder(Match, 'match')
      .where('match.api_matchId IN (:...api_matchId)', { api_matchId })
      .getMany();
  }

  async updateAllByApiMatchIdIfNotUpdated(matches: Match[], entityManager?: EntityManager) {
    if (!matches || matches.length === 0) return;

    const manager = entityManager || this.dataSource.manager;
    const updatePromises = matches.map((match) =>
      manager
        .createQueryBuilder()
        .update(Match)
        .set({
          kickoffDate: match.kickoffDate,
          scoreHome: match.scoreHome,
          scoreAway: match.scoreAway,
          lastApiUpdateDate: match.lastApiUpdateDate,
        })
        .where('api_matchId = :api_matchId', { api_matchId: match.api_matchId })
        .andWhere(
          new Brackets((qb) => {
            qb.where('lastApiUpdateDate IS NULL').orWhere('lastApiUpdateDate < :lastApiUpdateDate', {
              lastApiUpdateDate: new Date(match.lastApiUpdateDate),
            });
          })
        )
        .execute()
    );

    return Promise.all(updatePromises);
  }
}
