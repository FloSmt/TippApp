import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Tipgroup} from "./tipgroup.entity";

@Entity('tipgroup_users')
export class TipgroupUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tipgroups, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => Tipgroup, (tipgroup) => tipgroup.users, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'tipgroupId'})
  tipgroup: Tipgroup;

  @Column( {default: false})
  isAdmin: boolean;

  @Column()
  joinDate: Date;
}
