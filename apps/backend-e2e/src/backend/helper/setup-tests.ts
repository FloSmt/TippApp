/* eslint-disable */
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {User} from "@tippapp/backend/database";
import {RegisterDto} from "@tippapp/shared/data-access";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "@tippapp/backend/core";
import {getRepositoryToken} from "@nestjs/typeorm";
import {AuthService} from "@tippapp/backend/auth";
import {TestApi} from "./test-utils";

interface TestSetupResult {
  app: INestApplication;
  dataSource: DataSource;
  testApi: TestApi;
  userRepository: Repository<User>;
  authService: AuthService;
}

export async function setupE2ETestEnvironment(): Promise<TestSetupResult> {
  let userRepository: Repository<User>;
  let authService: AuthService;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  let app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  let dataSource = app.get(DataSource);
  userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  authService = moduleFixture.get<AuthService>(AuthService);

  let testApi = new TestApi(app);

  return {app: app, dataSource: dataSource, testApi, authService, userRepository}
}

export async function registerMultipleUsers(registerDtos: RegisterDto[], userRepository: Repository<User>, authService: AuthService): Promise<User[]> {
  let testUsers: User[] = [];
  for (const registerDto of registerDtos) {
    const testUser = userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: await authService.hashPassword(registerDto.password),
    });

    await userRepository.save(testUser);
    testUsers.push(testUser);
  }

  return testUsers;
}
