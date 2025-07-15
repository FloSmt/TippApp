import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { API_ROUTES } from './routes';

export class TestApi {
  private readonly app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  async loginAndGetToken(email: string, password: string): Promise<string> {
    const response = await this.getAgent()
      .post(API_ROUTES.AUTH.LOGIN)
      .send({ email, password });

    return response.body.accessToken;
  }

  async getTipgroups(authToken: string) {
    return await this.getAgent()
      .get(API_ROUTES.USER.TIPGROUPS)
      .set('Authorization', `Bearer ${authToken}`);
  }

  async createTipgroup(data: any, authToken: string) {
    return await this.getAgent()
      .post(API_ROUTES.TIPGROUP.CREATE)
      .set('Authorization', `Bearer ${authToken}`)
      .send(data);
  }

  private getAgent() {
    return supertest(this.app.getHttpServer());
  }
}
