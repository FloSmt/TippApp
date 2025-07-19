import supertest from "supertest";
import {INestApplication} from "@nestjs/common";
import {DataSource} from "typeorm";
import {Match, Matchday, Tip, Tipgroup, TipgroupUser, TipSeason, User} from "@tippapp/shared/data-access";

export class Factory {
  private readonly app: INestApplication;
  private readonly dataSource: DataSource;

  constructor(app: INestApplication, dataSource: DataSource) {
    this.app = app;
    this.dataSource = dataSource;
  }

  public async clearDatabase() {
    const entities = [TipgroupUser, Tipgroup, TipSeason, Matchday, Match, User, Tip];
    for (const entity of entities) {
      await this.dataSource.createQueryBuilder().delete().from(entity).execute();
    }
  }

  protected getAgent() {
    return supertest(this.app.getHttpServer());
  }

  protected getDataSource() {
    return this.dataSource;
  }
}
