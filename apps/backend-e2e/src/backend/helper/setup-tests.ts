/* eslint-disable */
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {User} from "@tippapp/backend/database";
import {RegisterDto} from "@tippapp/shared/data-access";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "@tippapp/backend/core";
import {getRepositoryToken} from "@nestjs/typeorm";
import {AuthService} from "@tippapp/backend/auth";
import request from 'supertest';
import {setupMockApi} from "./mockserver.helper";

interface TestSetupResult {
  app: INestApplication;
  dataSource: DataSource;
  authToken: string;
  userRepository: Repository<User>;
  testUser: User;
}

interface TestSetupOptions {
  login?: boolean;
  mockApi?: boolean;
  registerUserDto?: RegisterDto;
}

export async function setupE2ETestEnvironment(options: TestSetupOptions = {}): Promise<TestSetupResult> {
  if (options.mockApi ?? false) {
    await setupMockApi();
  }

  let userRepository: Repository<User>;
  let authService: AuthService = undefined;
  let authToken: any = undefined;
  let testUser: User = undefined;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  let app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  let dataSource = app.get(DataSource);
  userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  if (options.login ?? false) {
    authService = moduleFixture.get<AuthService>(AuthService);

    let registerDto: RegisterDto = {
      username: 'testuser',
      email: 'testuser@test.com',
      password: 'password123', ...options.registerUserDto
    }

    testUser = userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: await authService.hashPassword(registerDto.password),
    });

    await userRepository.save(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({email: registerDto.email, password: registerDto.password});

    authToken = loginResponse.body.accessToken;

    if (!authToken) {
      console.error('Failed to get auth token in test setup:', loginResponse.body);
      throw new Error('Authentication failed during E2E test environment setup.');
    }
  }

  return {app: app, userRepository: userRepository, authToken: authToken, dataSource: dataSource, testUser}
}
