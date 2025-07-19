import {CreateTipgroupDto} from "@tippapp/shared/data-access";
import {INestApplication} from "@nestjs/common";
import * as supertest from "supertest";
import {DataSource} from "typeorm";
import {API_ROUTES} from "../helper";
import {Factory} from "./factory";

export class TipgroupFactory extends Factory {
  constructor(app: INestApplication, dataSource: DataSource) {
    super(app, dataSource);
  }

  async createTipGroup(accessToken: string, createTipGroupDto: CreateTipgroupDto): Promise<supertest.Response> {
    return await this.getAgent()
      .post(API_ROUTES.TIPGROUP.CREATE)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createTipGroupDto);
  }
}
