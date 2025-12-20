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
    const savedTipgroup = await tipgroupRepository.save(tipgroup);
    return savedTipgroup;
  }

  async countTipGroupsInDatabase(): Promise<number> {
    const tipgroupRepository = this.getDataSource().getRepository(Tipgroup);
    return await tipgroupRepository.count();
  }

  async getTipGroupsOfUser(authToken: string) {
    return await this.getAgent().get(API_ROUTES.TIPGROUP.GET_ALL).set('Authorization', `Bearer ${authToken}`);
  }
}
