import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TipgroupUser} from "./tipgroupUser.entity";
import {TipSeason} from "./tipSeason.entity";

@Entity('tipgroups')
export class Tipgroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createDate: Date;

  @Column()
  passwordHash: string;

  @OneToMany(() => TipgroupUser, (tipgroupUser) => tipgroupUser.tipgroup)
  users: TipgroupUser[];

  @OneToMany(() => TipSeason, (tipSeason) => tipSeason.tipgroup)
  seasons: TipSeason[];
}
