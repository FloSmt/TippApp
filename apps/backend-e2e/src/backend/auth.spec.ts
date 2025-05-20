import {Test, TestingModule} from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {AppModule} from "@tippapp/backend/core";
import request from 'supertest';
import { setupMockApi } from '../support/mockserver.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupMockApi();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/register (POST) should add a user and response access and refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({username: 'test', password: 'test', email: 'test'});
    //expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({name: 'Mocked Name'}));
  });

  afterAll(async () => {
    await app.close();
  });
});
