import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from './user.service';
import {Repository} from 'typeorm';
import {getRepositoryToken} from '@nestjs/typeorm';
import {Tipgroup, TipgroupUser, User} from '@tippapp/backend/database';
import {RegisterDto} from '@tippapp/shared/data-access';
import {createMock, DeepMocked} from "@golevelup/ts-jest";

describe('UserService', () => {
  let service: UserService;
  let userRepository: DeepMocked<Repository<User>>;
  let tipgroupUserRepository: DeepMocked<Repository<TipgroupUser>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>()
        },
        {
          provide: getRepositoryToken(TipgroupUser),
          useValue: createMock<Repository<TipgroupUser>>()
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    tipgroupUserRepository = module.get(getRepositoryToken(TipgroupUser));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update the refresh token of a user', async () => {
    const userId = 1;
    const refreshToken = 'newRefreshToken';

    await service.updateRefreshToken(userId, refreshToken);

    expect(userRepository.update).toHaveBeenCalledWith(userId, { refreshToken });
  });

  it('should return a user by id', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findById(1);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('should return a user by email', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findByEmail('test@example.com');

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(result).toEqual(user);
  });

  it('should create and save a new user', async () => {
    const registerDto: RegisterDto = { email: 'test@example.com', password: 'hashedPassword', username: 'username'};
    const user = { id: 1, ...registerDto } as User;

    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);

    const result = await service.create(registerDto);

    expect(userRepository.create).toHaveBeenCalledWith(registerDto);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should return an array of tip groups for a given user ID', async () => {
    const userId = 1;

    const tipgroup1 = new Tipgroup();
    tipgroup1.id = 101;
    tipgroup1.name = 'Group1';

    const tipgroup2 = new Tipgroup();
    tipgroup2.id = 102;
    tipgroup2.name = 'Group2';

    const tipgroupUserEntry1 = new TipgroupUser();
    tipgroupUserEntry1.userId = userId;
    tipgroupUserEntry1.tipgroup = tipgroup1;

    const tipgroupUserEntry2 = new TipgroupUser();
    tipgroupUserEntry2.userId = userId;
    tipgroupUserEntry2.tipgroup = tipgroup2;

    tipgroupUserRepository.find.mockResolvedValue([tipgroupUserEntry1, tipgroupUserEntry2]);

    const result = await service.getTipGroupsByUserId(userId);

    expect(result).toEqual([tipgroup1, tipgroup2]);
    expect(tipgroupUserRepository.find).toHaveBeenCalledWith({
      where: {userId: userId},
      relations: ['tipgroup'],
    });
  });
});
