import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Tipgroup} from "./tipgroup.entity";

@Entity('tipgroup_users')
export class TipgroupUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tipgroups, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Tipgroup, (tipgroup) => tipgroup.users, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'tipgroupId'})
  tipgroup: Tipgroup;

  @Column()
  tipgroupId: number;

  @Column( {default: false})
  isAdmin: boolean;

  @CreateDateColumn()
  joinDate: Date;
}
