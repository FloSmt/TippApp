import {Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Match} from "./match.entity";

@Entity('tips')
export class Tip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  predictionHomeScore: number;

  @Column()
  predictionAwayScore: number;

  @Column()
  tipDate: Date;

  @ManyToOne(() => User, (user) => user.tips, {onDelete: 'CASCADE'})
  @JoinTable( {name: 'userId'})
  user: User;

  @ManyToOne(() => Match, (match) => match.tips, {onDelete: 'CASCADE'})
  @JoinTable( {name: 'matchId'})
  match: Match;
}
