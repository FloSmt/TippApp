import { RegisterDto, User } from '@tippapp/shared/data-access';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { API_ROUTES } from '../helper';
import { Factory } from './factory';

export class UserFactory extends Factory {
  constructor(app: INestApplication, dataSource: DataSource) {
    super(app, dataSource);
  }

  async createUserInDatabase(registerDto: RegisterDto): Promise<User | null> {
    const userRepository = this.getDataSource().getRepository(User);
    await this.getAgent().post(API_ROUTES.AUTH.REGISTER).send(registerDto);

    return userRepository.findOne({
      where: { email: registerDto.email },
    });
  }

  async loginUser(email: string, password: string) {
    const response = await this.getAgent()
      .post(API_ROUTES.AUTH.LOGIN)
      .send({ email, password });

    return response.body.accessToken;
  }

  async getTipGroups(authToken: string) {
    return await this.getAgent()
      .get(API_ROUTES.USER.TIPGROUPS)
      .set('Authorization', `Bearer ${authToken}`);
  }
}
