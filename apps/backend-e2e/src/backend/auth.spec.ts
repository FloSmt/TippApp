import {INestApplication} from '@nestjs/common';
import request from 'supertest';
import supertest from 'supertest';
import * as bcrypt from 'bcrypt';
import {DataSource, Repository} from 'typeorm';
import {LoginDto, RegisterDto, User} from '@tippapp/shared/data-access';
import {API_ROUTES, setupE2ETestEnvironment, UserFactory,} from '@tippapp/backend/test-helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userFactory: UserFactory;

  let userRepository: Repository<User>;

  const mocks = {
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
    userRepository = dataSource.getRepository(User);
    userFactory = new UserFactory(app, dataSource);
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
      const foundUser = await userRepository.findOne({where: {email: registerDto.email}});
      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe(registerDto.username);
      expect(foundUser.email).toBe(registerDto.email);
      expect(foundUser.refreshToken).toBeDefined();

      const correctPassword = await bcrypt.compare(
        registerDto.password,
        foundUser.password
      );
      expect(correctPassword).toBeTruthy();
      checkCookieResponse(response, foundUser.refreshToken);
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
    const registerDto = mocks.registerData[0];
    let registeredUser: User;

    beforeEach(async () => {
      // Create User in Database
      await userFactory.createUserInDatabase(registerDto);
      registeredUser = await userRepository.findOne({
        where: {email: registerDto.email},
      });
    });

    it('should response AuthResponse and generates new refreshToken', async () => {
      const oldRefreshToken = registeredUser.refreshToken;

      // Login with same credentials
      const response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send({email: registerDto.email, password: registerDto.password} as LoginDto);

      expect(response.status).toBe(200);
      expectAuthResponse(response);

      const userAfterLogin = await userRepository.findOne({
        where: {email: registerDto.email},
      });
      const newRefreshToken = userAfterLogin.refreshToken;

      expect(newRefreshToken !== oldRefreshToken).toBeTruthy();
      checkCookieResponse(response, newRefreshToken);
    });

    it('should throw Error 401 if user was not found or password is wrong', async () => {
      // Login with wrong email
      let response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send({email: 'wrongEmail@email.de', password: registerDto.password} as LoginDto);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User not found');

      // Login with wrong password
      response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.LOGIN)
        .send({email: registerDto.email, password: 'wrongPassword'} as LoginDto);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('/refresh (POST)', () => {
    const registerDto = mocks.registerData[0];
    let registeredUser: User;

    beforeEach(async () => {
      // Create User in Database
      await userFactory.createUserInDatabase(registerDto);
      registeredUser = await userRepository.findOne({
        where: {email: registerDto.email},
      });
    });

    it('should response AuthResponse and generates new refreshToken', async () => {
      const oldRefreshToken = registeredUser.refreshToken;

      // Refresh with refreshToken
      const response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)
        .set('Cookie', 'refreshToken=' + oldRefreshToken);

      expect(response.status).toBe(200);
      expectAuthResponse(response);

      const userAfterRefresh = await userRepository.findOne({
        where: {email: registerDto.email},
      });

      const newRefreshToken = userAfterRefresh.refreshToken;
      expect(newRefreshToken !== oldRefreshToken).toBeTruthy();
      checkCookieResponse(response, newRefreshToken);
    });

    it('should throw Error 401 if invalid refreshToken was send', async () => {
      // Refresh with wrong refreshToken
      const response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)
        .set('Cookie', 'refreshToken=wrongToken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid refreshToken');
    });

    it('should throw Error 401 if no refreshToken was send', async () => {
      // Refresh with wrong refreshToken
      const response = await request(app.getHttpServer())
        .post(API_ROUTES.AUTH.REFRESH)

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid refreshToken');
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userFactory.clearDatabase();
  });

  function verifyToken(token: string) {
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  }

  function checkCookieResponse(response: supertest.Response, newRefreshToken: string) {
    const newSetCookieHeader = response.headers['set-cookie'];
    expect(newSetCookieHeader).toBeDefined();
    const cookieRefreshTokenPath = newSetCookieHeader[0].split(';').find(part => part.trim().startsWith('refreshToken='));
    expect(cookieRefreshTokenPath).toBe('refreshToken=' + newRefreshToken);
  }

  function expectAuthResponse(response: any) {
    expect(response.body).toHaveProperty('accessToken');

    // Verify Access Token
    const accessToken = response.body.accessToken;
    verifyToken(accessToken);
  }
});
