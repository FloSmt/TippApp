import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(() => Match, (match) => match.matchday, {
    cascade: true,
  })
  matches: Match[];
}
