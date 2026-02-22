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

  @ManyToOne(() => TipSeason, (tipSeason) => tipSeason.matchdays, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'seasonId' })
  season: TipSeason;

  @Column({ nullable: true })
  seasonId: number;

  @ManyToMany(() => Match, (match) => match.matchdays, { onDelete: 'CASCADE', onUpdate: 'CASCADE', cascade: true })
  @JoinTable()
  matches: Match[];

  @Column({ nullable: true, default: null, type: 'date' })
  startDate: Date | null;

  @Column({ nullable: true, default: null, type: 'date' })
  endDate: Date | null;

  @Column({ default: false, type: 'boolean' })
  isFinished: boolean;
}
