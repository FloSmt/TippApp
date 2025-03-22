import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TipSeason} from "./tipSeason.entity";
import {Match} from "./match.entity";

@Entity('matchdays')
export class Matchday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  orderId: number;

  @Column()
  api_groupId: number;

  @ManyToOne(() => TipSeason, (tipSeason) => tipSeason.matchdays, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'seasonId'})
  season: TipSeason;

  @OneToMany(() => Match, (match) => match.matchday)
  matches: Match[];
}
