import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { LoginDto, RegisterDto, User } from '@tippapp/shared/data-access';
import { setupE2ETestEnvironment } from './helper/setup-tests';
import { API_ROUTES } from './helper/routes';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let userRepository: Repository<User>;

  const mocks = {
    get loginData(): LoginDto[] {
      return [
        {
          email: 'test@email.de',
          password: '1234',
        },
        {
          email: 'wrongEmail@email.de',
          password: '1234',
        },
        {
          email: 'test@email.de',
          password: 'wrongPassword',
        },
      ];
    },

    get registerData(): RegisterDto[] {
      return [
        {
          username: 'test',
          email: 'test@email.de',
          password: '1234',
        },
      ];
    },
  };

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment();
    app = setup.app;
    dataSource = setup.dataSource;
    userRepository = setup.userRepository;
  });

  describe('/register (POST)', () => {
    it('should add a user into Database and response AuthResponse', async () => {
      const registerDto = mocks.registerData[0];

      const response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
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

      const correctPassword = await bcrypt.compare(
        registerDto.password,
        foundUser.password
      );
      expect(correctPassword).toBeTruthy();
    });

    it('should throw Error 409 if email already exists', async () => {
      const registerDto = mocks.registerData[0];

      // first Register of User
      let response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);
      expect(response.status).toBe(201);

      // second registration with same User content
      response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email already exists');
    });
  });

  describe('/login (POST)', () => {
    it('should response AuthResponse and generates new refreshToken', async () => {
      const registerDto = mocks.registerData[0];
      const loginDto = mocks.loginData[0];

      // Register new User
      const response1 = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);
      const userOnRegistration = await userRepository.findOne({
        where: { id: response1.body.userId },
      });
      const oldRefreshToken = userOnRegistration.refreshToken;

      // Delay between registration and login to get different tokens
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Login with same credentials
      const response2 = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send(loginDto);
      expect(response2.status).toBe(200);
      expectAuthResponse(response2);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const userOnLogin = await userRepository.findOne({
        where: { id: response2.body.userId },
      });
      const newRefreshToken = userOnLogin.refreshToken;

      expect(newRefreshToken !== oldRefreshToken).toBeTruthy();
    });

    it('should throw Error 401 if user was not found or password is wrong', async () => {
      const registerDto = mocks.registerData[0];
      let loginDto = mocks.loginData[1];

      // Register new User
      await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);

      // Login with wrong email
      let response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send(loginDto);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User not found');

      // Login with wrong password
      loginDto = mocks.loginData[2];
      response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send(loginDto);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('/refresh (POST)', () => {
    it('should response AuthResponse and generates new refreshToken', async () => {
      const registerDto = mocks.registerData[0];

      // Register new User
      const response1 = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);
      const userOnRegistration = await userRepository.findOne({
        where: { id: response1.body.userId },
      });
      const oldRefreshToken = userOnRegistration.refreshToken;
      const userId = userOnRegistration.id;

      // Delay between registration and login to get different tokens
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Login with same credentials
      const response2 = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)
        .send({
          userId: userId,
          refreshToken: oldRefreshToken,
        });
      expect(response2.status).toBe(200);
      expectAuthResponse(response2);

      const userOnLogin = await userRepository.findOne({
        where: { id: response2.body.userId },
      });
      const newRefreshToken = userOnLogin.refreshToken;

      expect(newRefreshToken !== oldRefreshToken).toBeTruthy();
    });

    it('should throw Error 401 if user was not found or invalid refreshToken was send', async () => {
      const registerDto = mocks.registerData[0];

      // Register new User
      const response1 = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REGISTER)
        .send(registerDto);
      const userOnRegistration = await userRepository.findOne({
        where: { id: response1.body.userId },
      });
      const oldRefreshToken = userOnRegistration.refreshToken;
      const userId = userOnRegistration.id;

      // Refresh with wrong UserId
      let response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)
        .send({ userId: userId + 1, refreshToken: oldRefreshToken });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User not found');

      // Refresh with wrong refreshToken
      response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)
        .send({ userId: userId, refreshToken: 'wrongToken' });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid refreshToken');
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clear Database Table after Test
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

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
