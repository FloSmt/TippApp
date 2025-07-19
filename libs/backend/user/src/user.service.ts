import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {RegisterDto, Tipgroup, TipgroupUser, User,} from '@tippapp/shared/data-access';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TipgroupUser)
    private readonly tipgroupUserRepository: Repository<TipgroupUser>
  ) {}

  async updateRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.userRepository.findOneBy({refreshToken});
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const user = this.userRepository.create(registerDto);
    return this.userRepository.save(user);
  }

  async getTipGroupsByUserId(userId: number): Promise<Tipgroup[]> {
    const tipGroupUserEntries = await this.tipgroupUserRepository.find({
      where: { userId: userId },
      relations: ['tipgroup'],
    });

    return tipGroupUserEntries.map((entry) => entry.tipgroup);
  }
}
