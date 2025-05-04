import * as request from 'supertest';
import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {setupMockApi} from "../support/mockserver.helper";
import {AppModule} from "@tippapp/backend/core";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupMockApi(); // Setzt Mock in MockServer

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/my-api (GET) sollte Mock-Daten liefern', async () => {
    const res = await request(app.getHttpServer()).get('/my-api');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({name: 'Mocked Name'}));
  });

  afterAll(async () => {
    await app.close();
  });
});
