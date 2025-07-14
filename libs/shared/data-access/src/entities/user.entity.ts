import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TipgroupUser } from './tipgroupUser.entity';
import { Tip } from './tip.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  email: string;

  @Column()
  @ApiProperty()
  username: string;

  @Column()
  @ApiProperty()
  password?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  @ApiProperty()
  createDate?: Date;

  @OneToMany(() => TipgroupUser, (tipgroupUser) => tipgroupUser.user)
  tipgroups?: TipgroupUser[];

  @OneToMany(() => Tip, (tip) => tip.user)
  tips?: Tip[];
}
