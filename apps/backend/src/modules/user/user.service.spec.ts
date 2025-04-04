import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from '../../auth/dto/register.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            update: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should update the refresh token of a user', async () => {
    const userId = 1;
    const refreshToken = 'newRefreshToken';

    await userService.updateRefreshToken(userId, refreshToken);

    expect(userRepository.update).toHaveBeenCalledWith(userId, { refreshToken });
  });

  it('should return a user by id', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

    const result = await userService.findById(1);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('should return a user by email', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

    const result = await userService.findByEmail('test@example.com');

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(result).toEqual(user);
  });

  it('should create and save a new user', async () => {
    const registerDto: RegisterDto = { email: 'test@example.com', password: 'hashedPassword', username: 'username'};
    const user = { id: 1, ...registerDto } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(userRepository, 'save').mockResolvedValue(user);

    const result = await userService.create(registerDto);

    expect(userRepository.create).toHaveBeenCalledWith(registerDto);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });
});
