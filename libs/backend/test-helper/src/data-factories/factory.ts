import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class Factory {
  private readonly app: INestApplication;
  private readonly dataSource: DataSource;

  constructor(app: INestApplication, dataSource: DataSource) {
    this.app = app;
    this.dataSource = dataSource;
  }

  public async clearDatabase() {
    await this.dataSource.synchronize(true);
  }

  protected getAgent() {
    return supertest(this.app.getHttpServer());
  }

  protected getDataSource() {
    return this.dataSource;
  }
}
