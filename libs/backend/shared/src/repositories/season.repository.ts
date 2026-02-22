import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Matchday, MatchdayOverviewResponseDto, Tipgroup, TipSeason } from '@tippapp/shared/data-access';

@Injectable()
export class SeasonRepository extends Repository<TipSeason> {
  constructor(private dataSource: DataSource) {
    super(TipSeason, dataSource.createEntityManager());
  }

  async getAllMatchdays(tipgroupId: number, seasonId: number): Promise<MatchdayOverviewResponseDto[]> {
    return this.dataSource
      .createQueryBuilder(Tipgroup, 'tipgroup')
      .where('tipgroup.id = :tipgroupId', { tipgroupId })
      .leftJoin('tipgroup.seasons', 'season', 'season.id = :seasonId', { seasonId })
      .leftJoin('season.matchdays', 'matchday')
      .select([
        'matchday.id AS matchdayId',
        'matchday.name AS name',
        'matchday.orderId AS orderId',
        'matchday.startDate AS startDate',
        'matchday.endDate AS endDate',
        'matchday.isFinished AS isFinished',
        'COUNT(match.id) AS matchCount',
      ])
      .leftJoin('matchday.matches', 'match')
      .groupBy('matchday.id')
      .addGroupBy('matchday.name')
      .addGroupBy('matchday.orderId')
      .orderBy('matchday.orderId', 'ASC')
      .getRawMany<MatchdayOverviewResponseDto>();
  }

  async getCurrentMatchday(seasonId: number): Promise<Matchday | null> {
    return this.dataSource
      .createQueryBuilder(Matchday, 'matchday')
      .innerJoin('matchday.matches', 'match')
      .where('matchday.seasonId = :seasonId', { seasonId })
      .andWhere('match.kickoffDate IS NOT NULL')
      .orderBy('ABS(UNIX_TIMESTAMP(match.kickoffDate) - UNIX_TIMESTAMP(:now))', 'ASC')
      .setParameter('now', new Date())
      .limit(1)
      .getOne();
  }
}
