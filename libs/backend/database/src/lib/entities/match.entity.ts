import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Matchday} from "./matchday.entity";
import {Tip} from "./tip.entity";

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  api_matchId: number;

  @ManyToOne(() => Matchday, (matchday) => matchday.matches, {onDelete: 'CASCADE'})
  @JoinColumn( {name: 'matchdayId'})
  matchday: Matchday;

  @Column({nullable: true})
  matchdayId: number;

  @OneToMany(() => Tip, (tip) => tip.match)
  tips: Tip[];
}
