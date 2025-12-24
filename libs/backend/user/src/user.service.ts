import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RegisterDto, User } from '@tippapp/shared/data-access';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async findById(id: number, entityManager?: EntityManager): Promise<User | null> {
    entityManager = entityManager ?? this.userRepository.manager;
    return entityManager.findOne(User, { where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const user = this.userRepository.create(registerDto);
    return this.userRepository.save(user);
  }
}
