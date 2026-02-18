import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Match } from '@tippapp/shared/data-access';

@Injectable()
export class MatchRepository extends Repository<Match> {
  constructor(private dataSource: DataSource) {
    super(Match, dataSource.createEntityManager());
  }

  async updateOrInsertMatches(matches: Match[], entityManager?: EntityManager) {
    if (!matches || matches.length === 0) return;

    const manager = entityManager || this.dataSource.manager;
    return manager
      .createQueryBuilder()
      .insert()
      .into(Match)
      .values(matches)
      .orUpdate(['kickoffDate', 'scoreHome', 'scoreAway', 'isFinished', 'lastApiUpdateDate'], ['api_matchId'])
      .updateEntity(false)
      .execute();
  }

  async findAllByApiMatchId(api_matchId: number[], entityManager?: EntityManager): Promise<Match[]> {
    if (!api_matchId || api_matchId.length === 0) return [];

    const manager = entityManager || this.dataSource.manager;
    return manager
      .createQueryBuilder(Match, 'match')
      .where('match.api_matchId IN (:...api_matchId)', { api_matchId })
      .getMany();
  }

  async updateAllByApiMatchIdIfNotUpdated(matches: Match[], entityManager?: EntityManager): Promise<Match[]> {
    if (!matches || matches.length === 0) return [];

    const manager = entityManager || this.dataSource.manager;

    const existingMatches = await this.getOutdatedMatches(matches, entityManager);

    const existingMap = new Map(existingMatches.map((m) => [m.api_matchId, m]));
    const toUpdate: Match[] = [];

    for (const matchData of matches) {
      const existing = existingMap.get(matchData.api_matchId);

      if (!existing) {
        continue;
      }

      const isNewer =
        !existing.lastApiUpdateDate || new Date(matchData.lastApiUpdateDate) > new Date(existing.lastApiUpdateDate);

      if (!isNewer) {
        continue;
      }

      existing.kickoffDate = matchData.kickoffDate;
      existing.scoreHome = matchData.scoreHome;
      existing.scoreAway = matchData.scoreAway;
      existing.isFinished = matchData.isFinished;
      existing.lastApiUpdateDate = matchData.lastApiUpdateDate;

      toUpdate.push(existing);
    }

    if (toUpdate.length > 0) {
      return await manager.save(toUpdate, { chunk: 100 });
    }

    return [];
  }

  async getOutdatedMatches(updatedMatches: Match[], entityManager?: EntityManager): Promise<Match[]> {
    if (!updatedMatches || updatedMatches.length === 0) return [];

    const manager = entityManager || this.dataSource.manager;
    const qb = manager.createQueryBuilder(Match, 'match');

    updatedMatches.forEach((updatedMatch, index) => {
      const condition = `
      match.api_matchId = :id${index} AND (
        match.scoreHome != :hScore${index} OR
        match.scoreAway != :aScore${index} OR
        match.kickoffDate != :kickoffDate${index} OR
        match.isFinished != :isFinished${index}
      )
    `;

      const params = {
        [`id${index}`]: updatedMatch.api_matchId,
        [`hScore${index}`]: updatedMatch.scoreHome,
        [`aScore${index}`]: updatedMatch.scoreHome,
        [`kickoffDate${index}`]: updatedMatch.kickoffDate,
        [`isFinished${index}`]: updatedMatch.isFinished,
      };

      if (index === 0) {
        qb.where(condition, params);
      } else {
        qb.orWhere(condition, params);
      }
    });

    return await qb.getMany();
  }
}
