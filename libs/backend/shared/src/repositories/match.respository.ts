import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Match } from '@tippapp/shared/data-access';

@Injectable()
export class MatchRepository extends Repository<Match> {
  constructor(private dataSource: DataSource) {
    super(Match, dataSource.createEntityManager());
  }

  async findAllByApiMatchId(api_matchId: number[], entityManager?: EntityManager): Promise<Match[] | undefined> {
    const manager = entityManager || this.dataSource.manager;
    return manager
      .createQueryBuilder(Match, 'match')
      .where('match.api_matchId IN (:...api_matchId)', { api_matchId })
      .getMany();
  }
}
