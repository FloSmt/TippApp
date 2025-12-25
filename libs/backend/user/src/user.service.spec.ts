import { Test, TestingModule } from '@nestjs/testing';
import { RegisterDto, User } from '@tippapp/shared/data-access';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserRepository } from '@tippapp/backend/shared';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: DeepMocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: createMock<UserRepository>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update the refresh token of a user', async () => {
    const userId = 1;
    const refreshToken = 'newRefreshToken';

    await service.updateRefreshToken(userId, refreshToken);

    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      refreshToken,
    });
  });

  it('should return a user by id using entityManager (default)', async () => {
    const user = { id: 2, email: 'other@example.com' } as User;
    const entityManager = {
      findOne: jest.fn().mockResolvedValue(user),
    };

    const serviceWithManager = new UserService({ manager: entityManager } as any);

    const result = await serviceWithManager.findById(2);

    expect(entityManager.findOne).toHaveBeenCalledWith(User, {
      where: { id: 2 },
    });
    expect(result).toBe(user);
  });

  it('should return a user by email', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findByEmail('test@example.com');

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(result).toEqual(user);
  });

  it('should create and save a new user', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'hashedPassword',
      username: 'username',
    };
    const user = { id: 1, ...registerDto } as User;

    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);

    const result = await service.create(registerDto);

    expect(userRepository.create).toHaveBeenCalledWith(registerDto);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });
});
