import {Test, TestingModule} from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {AppModule} from "@tippapp/backend/core";
import request from 'supertest';
import * as bcrypt from "bcrypt";
import { DataSource, Repository } from 'typeorm';
import { User } from '@tippapp/backend/database';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginDto, RegisterDto } from '@tippapp/shared/data-access';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let userRepository: Repository<User>;

  const mocks = {
    get loginData(): LoginDto[] {
      return [{
        email: 'test@email.de',
        password: '1234'
      }]
    },

    get registerData(): RegisterDto[] {
      return [{
        username: 'test',
        email: 'test@email.de',
        password: '1234'
      }]
    }
  }

  beforeAll(async () => {
    // await setupMockApi();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('/register (POST)', () => {
    it('should add a user into Database and response AuthResponse', async () => {
      const registerDto = mocks.registerData[0];

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // Check if correct Response was sent
      expect(response.status).toBe(201);
      expectAuthResponse(response);

      // Check Database entries
      const userId = response.body.userId;
      const refreshToken = response.body.refreshToken;

      const foundUser = await userRepository.findOne({ where: { id: userId } });
      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe(registerDto.username);
      expect(foundUser.email).toBe(registerDto.email);
      expect(foundUser.refreshToken).toBe(refreshToken);

      const correctPassword = await bcrypt.compare(registerDto.password, foundUser.password);
      expect(correctPassword).toBeTruthy();
    });

    it('should throw Error 409 if email already exists', async () => {
      const registerDto = mocks.registerData[0];

      // first Register of User
      let response = await request(app.getHttpServer()).post('/auth/register').send(registerDto);
      expect(response.status).toBe(201);

      // second registration with same User content
      response = await request(app.getHttpServer()).post('/auth/register').send(registerDto);
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email already exists');
    });
  })

  describe('/login (POST)', () => {
    it('should response AuthResponse and generates new refreshToken', async () => {
      const registerDto = mocks.registerData[0];
      const loginDto = mocks.loginData[0];

      // Register new User
      let response = await request(app.getHttpServer()).post('/auth/register').send(registerDto);
      // let foundUser = await userRepository.findOne({ where: { id: response.body.userId } });
      // const oldRefreshToken = foundUser.refreshToken;

      // Login with same credentials
      response = await request(app.getHttpServer()).post('/auth/login').send(loginDto);
      expect(response.status).toBe(200);
      expectAuthResponse(response);

      /*TODO: check if new refreshToken is set*/

      // foundUser = await userRepository.findOne({ where: { id: response.body.userId } });
      // const newRefreshToken = foundUser.refreshToken;

      // console.log(newRefreshToken);
      // console.log(oldRefreshToken);
      // expect(newRefreshToken !== oldRefreshToken).toBeTruthy();
    });
  })

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clear Database Table after Test
    await dataSource.createQueryBuilder().delete().from(User).execute();
  })

  function verifyToken(token: string) {
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  }

  function expectAuthResponse(response: any) {
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('userId');

    // Verify Tokens
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    verifyToken(accessToken);
    verifyToken(refreshToken);
  }
});
