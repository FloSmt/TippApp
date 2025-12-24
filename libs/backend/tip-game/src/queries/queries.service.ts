import { Injectable } from '@nestjs/common';
import { MatchdayOverviewResponseDto, Tipgroup } from '@tippapp/shared/data-access';
import { DataSource } from 'typeorm';

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
export class QueriesService {
  constructor(private dataSource: DataSource) {}

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
        'COUNT(match.id) AS matchCount',
      ])
      .leftJoin('matchday.matches', 'match')
      .groupBy('matchday.id')
      .addGroupBy('matchday.name')
      .addGroupBy('matchday.orderId')
      .orderBy('matchday.orderId', 'ASC')
      .getRawMany<MatchdayOverviewResponseDto>();
  }
}
