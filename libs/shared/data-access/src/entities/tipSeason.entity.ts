import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tipgroup } from './tipgroup.entity';
import { Matchday } from './matchday.entity';

@Entity('seasons')
export class TipSeason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column( {default: false})
  isClosed: boolean;

  @Column()
  api_LeagueSeason: number;

  @ManyToOne(() => Tipgroup, (tipgroup) => tipgroup.seasons, {onDelete: 'CASCADE'})
  @JoinColumn( {name: 'tipgroupId'})
  tipgroup: Tipgroup;

  @Column({nullable: true})
  tipgroupId: number;

  @OneToMany(() => Matchday, (matchday) => matchday.season, {
    cascade: true
  })
  matchdays: Matchday[];

}
