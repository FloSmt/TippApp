import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TipgroupUser} from "./tipgroupUser.entity";
import {Tip} from "./tip.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  refreshToken: string;

  @CreateDateColumn()
  createDate: Date;

  @OneToMany(() => TipgroupUser, (tipgroupUser) => tipgroupUser.user)
  tipgroups: TipgroupUser[];

  @OneToMany(() => Tip, (tip) => tip.user)
  tips: Tip[];
}
