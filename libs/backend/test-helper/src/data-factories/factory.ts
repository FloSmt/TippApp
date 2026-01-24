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
    const entities = this.dataSource.entityMetadatas;
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
    }

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
  }

  protected getAgent() {
    return supertest(this.app.getHttpServer());
  }

  protected getDataSource() {
    return this.dataSource;
  }
}
