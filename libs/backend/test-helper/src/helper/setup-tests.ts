/* eslint-disable */
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '@tippapp/backend/core';
import cookieParser from "cookie-parser";

interface TestSetupResult {
  app: INestApplication;
  dataSource: DataSource;
}

export async function setupE2ETestEnvironment(): Promise<TestSetupResult> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  let app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.init();

  let dataSource = app.get(DataSource);

  return {
    app: app,
    dataSource: dataSource
  };
}
