import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Matchday, Tipgroup } from '@tippapp/shared/data-access';

export interface MatchDayQueryResult {
  matchday: {
    api_leagueSeason: number;
    api_groupOrderId: number;
    api_leagueShortcut: string;
    name: string;
    orderId: number;
    matches: { api_matchId: string }[];
  };
}

@Injectable()
export class MatchdayRepository extends Repository<Matchday> {
  constructor(private dataSource: DataSource) {
    super(Matchday, dataSource.createEntityManager());
  }

  async getMatchdayFromDb(
    tipgroupId: number,
    seasonId: number,
    matchdayId: number
  ): Promise<MatchDayQueryResult | undefined> {
    return this.dataSource
      .createQueryBuilder(Tipgroup, 'tipgroup')
      .where('tipgroup.id = :tipgroupId', { tipgroupId })
      .leftJoin('tipgroup.seasons', 'season', 'season.id = :seasonId', { seasonId })
      .leftJoin('season.matchdays', 'matchday', 'matchday.id = :matchdayId', { matchdayId })
      .leftJoin('matchday.matches', 'match')
      .select(
        `JSON_OBJECT(
      'api_leagueSeason', season.api_leagueSeason,
      'api_groupOrderId', matchday.api_groupOrderId,
      'api_leagueShortcut', matchday.api_leagueShortcut,
      'name', matchday.name,
      'orderId', matchday.orderId,
      'matches', COALESCE(
        JSON_ARRAYAGG(JSON_OBJECT('api_matchId', match.api_matchId)),
        JSON_ARRAY()
      )
    )
  `,
        'matchday'
      )
      .groupBy('season.api_leagueSeason')
      .addGroupBy('matchday.api_groupOrderId')
      .addGroupBy('matchday.api_leagueShortcut')
      .getRawOne();
  }

  async recalculateMatchdayStats(matchId: number) {
    const sql = `
    UPDATE matchdays md
    INNER JOIN (
    -- Subquery: Calculate Stats for all affected Matchdays
    SELECT
    m2m.matchdaysId,
    MIN(m.kickoffDate) AS startDate,
    MAX(m.kickoffDate) AS endDate,
    MIN(m.isFinished) AS isFinished
    FROM matchdays_matches_matches m2m
    INNER JOIN matches m ON m.id = m2m.matchesId
    WHERE m2m.matchdaysId IN (
    -- Only Matchdays that are associated with the updated Match
    SELECT matchdaysId FROM matchdays_matches_matches WHERE matchesId = ?
    )
    GROUP BY m2m.matchdaysId
    ) stats ON md.id = stats.matchdaysId
    SET
    md.startDate = stats.startDate,
      md.endDate = stats.endDate,
      md.isFinished = stats.isFinished`;

    try {
      await this.dataSource.query(sql, [matchId]);
    } catch (error) {
      Logger.error('Error on executing Bulk update for Matchdays', error);
    }
  }
}
