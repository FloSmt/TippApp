import {RegisterDto, User} from "@tippapp/shared/data-access";
import {DataSource} from "typeorm";
import * as bcrypt from 'bcrypt';
import {INestApplication} from "@nestjs/common";
import {API_ROUTES} from "../helper";
import {Factory} from "./factory";

export class UserFactory extends Factory {
  constructor(app: INestApplication, dataSource: DataSource) {
    super(app, dataSource);
  }

  async createUserInDatabase(registerDto: RegisterDto): Promise<User> {
    const userRepository = this.getDataSource().getRepository(User);
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      refreshToken: 'refreshToken',
    });

    return await userRepository.save(user);
  }

  async loginUser(email: string, password: string) {
    const response = await this.getAgent()
      .post(API_ROUTES.AUTH.LOGIN)
      .send({email, password});

    return response.body.accessToken;
  }

  async getTipGroups(authToken: string) {
    return await this.getAgent()
      .get(API_ROUTES.USER.TIPGROUPS)
      .set('Authorization', `Bearer ${authToken}`);
  }
}
