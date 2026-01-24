import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TipSeason } from './tipSeason.entity';
import { Match } from './match.entity';

@Entity('matchdays')
export class Matchday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  orderId: number;

  @Column()
  api_groupOrderId: number;

  @Column()
  api_leagueShortcut: string;

  @ManyToOne(() => TipSeason, (tipSeason) => tipSeason.matchdays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seasonId' })
  season: TipSeason;

  @Column({ nullable: true })
  seasonId: number;

  @ManyToMany(() => Match, (match) => match.matchdays)
  @JoinTable()
  matches: Match[];
}
