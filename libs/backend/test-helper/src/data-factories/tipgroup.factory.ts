import { CreateTipgroupDto, Tipgroup } from '@tippapp/shared/data-access';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { API_ROUTES } from '../helper';
import { Factory } from './factory';

export class TipgroupFactory extends Factory {
  constructor(app: INestApplication, dataSource: DataSource) {
    super(app, dataSource);
  }

  async createTipGroupWithRest(accessToken: string, createTipGroupDto: CreateTipgroupDto): Promise<supertest.Response> {
    return await this.getAgent()
      .post(API_ROUTES.TIPGROUP.CREATE)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createTipGroupDto);
  }

  async createTipGroupInDatabase(name: string): Promise<Tipgroup> {
    const tipgroupRepository = this.getDataSource().getRepository(Tipgroup);
    const tipgroup = tipgroupRepository.create({
      name,
      passwordHash: 'hashedpassword',
      users: [],
      seasons: [],
    });

    return await tipgroupRepository.save(tipgroup);
  }

  async getTipGroupsOfUser(authToken: string) {
    return await this.getAgent().get(API_ROUTES.TIPGROUP.GET_ALL).set('Authorization', `Bearer ${authToken}`);
  }

  async prepareTipgroupAndGetId(accessToken: string): Promise<number> {
    const createTipGroupDto: CreateTipgroupDto = {
      name: 'Test Tipgroup',
      password: 'testpassword',
      leagueShortcut: 'bl1',
      currentSeason: 2024,
    };
    const response = await this.createTipGroupWithRest(accessToken, createTipGroupDto);
    return response.body.id;
  }
}
