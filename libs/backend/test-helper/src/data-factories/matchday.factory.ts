import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { API_ROUTES } from '../helper';
import { Factory } from './factory';

export class MatchdayFactory extends Factory {
  private tipgroupId: number;
  private seasonId: number;
  private matchdayId: number;

  constructor(app: INestApplication, dataSource: DataSource) {
    super(app, dataSource);
  }

  setParameters(tipgroupId: number, seasonId: number, matchdayId: number): MatchdayFactory {
    this.tipgroupId = tipgroupId;
    this.seasonId = seasonId;
    this.matchdayId = matchdayId;
    return this;
  }

  async getMatchdayDetails(accessToken: string): Promise<supertest.Response> {
    return await this.getAgent()
      .get(API_ROUTES.TIPGROUP.MATCHDAY.GET_DETAILS(this.tipgroupId, this.seasonId, this.matchdayId))
      .set('Authorization', `Bearer ${accessToken}`);
  }
}
