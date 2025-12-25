import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipgroupUser, User } from '@tippapp/shared/data-access';
import { UserRepository } from '@tippapp/backend/shared';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, TipgroupUser])],
  providers: [UserService, UserRepository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
