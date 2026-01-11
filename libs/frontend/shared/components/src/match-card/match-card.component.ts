import { ChangeDetectionStrategy, Component, effect, inject, input, model, OnInit, signal } from '@angular/core';
import { MatchResponseDto } from '@tippapp/shared/data-access';
import { MatchState, TimerService } from '@tippapp/frontend/utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonBadge } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'lib-match-card',
  imports: [IonBadge],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class MatchCardComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly datePipe = inject(DatePipe);

  match = input.required<MatchResponseDto>();
  matchState = model<MatchState>(MatchState.UPCOMING_FAR);

  updateImpuls = toSignal(this.timerService.halfMinuteTick$);
  currentBatchContent = signal<string>('');
  currentScoreContent = signal<string>('');

  constructor() {
    effect(() => {
      if (this.updateImpuls()) {
        this.matchState.set(this.calculateMatchState());
        this.currentBatchContent.set(this.getBatchContent());
        this.currentScoreContent.set(this.getScoreContent());
      }
    });
  }

  ngOnInit() {
    this.matchState.set(this.calculateMatchState());
    this.currentBatchContent.set(this.getBatchContent());
    this.currentScoreContent.set(this.getScoreContent());
  }

  calculateMatchState() {
    const kickOfTime = new Date(this.match().scheduledDateTime);
    if (kickOfTime.getTime() > Date.now() + 1000 * 60 * 60) {
      return MatchState.UPCOMING_FAR;
    } else if (
      kickOfTime.getTime() > Date.now() ||
      (kickOfTime.getTime() > Date.now() - 1000 * 60 * 60 && this.match().scores.awayTeamScore === null)
    ) {
      return MatchState.UPCOMING_SOON;
    } else if (
      !this.match().isFinished &&
      this.match().scores.awayTeamScore !== null &&
      this.match().scores.homeTeamScore !== null
    ) {
      return MatchState.LIVE;
    } else if (
      this.match().isFinished &&
      this.match().scores.awayTeamScore !== null &&
      this.match().scores.homeTeamScore !== null
    ) {
      return MatchState.FINISHED;
    } else {
      return MatchState.POSTPONED;
    }
  }

  getScoreContent() {
    const kickOfTime = new Date(this.match().scheduledDateTime);
    switch (this.matchState()) {
      case MatchState.UPCOMING_SOON:
      case MatchState.UPCOMING_FAR:
      case MatchState.POSTPONED:
        return this.datePipe.transform(kickOfTime, 'HH:mm') || '';

      case MatchState.LIVE:
      case MatchState.FINISHED:
        return `${this.match().scores.homeTeamScore}:${this.match().scores.awayTeamScore}`;
    }
  }

  getBatchContent() {
    switch (this.matchState()) {
      case MatchState.LIVE:
        return 'Live';
      case MatchState.FINISHED:
        return 'Beendet';

      case MatchState.UPCOMING_SOON: {
        const kickOfTime = new Date(this.match().scheduledDateTime);
        return `In ${this.getLiveCountdown(kickOfTime)} min`;
      }

      case MatchState.POSTPONED:
        return 'Verschoben';

      default:
        return '';
    }
  }

  getLiveCountdown(targetDate: Date): number {
    return Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60)));
  }

  MatchState = MatchState;
}
