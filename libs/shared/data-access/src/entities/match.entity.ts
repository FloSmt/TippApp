import { Column, Entity, Index, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Matchday } from './matchday.entity';
import { Tip } from './tip.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  api_matchId: number;

  @ManyToMany(() => Matchday, (matchday) => matchday.matches)
  matchdays: Matchday[];

  @OneToMany(() => Tip, (tip) => tip.match)
  tips: Tip[];
}
