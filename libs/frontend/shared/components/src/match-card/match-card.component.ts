import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { MatchResponseDto } from '@tippapp/shared/data-access';
import { TimerService } from '@tippapp/frontend/utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonBadge } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

enum MatchState {
  LIVE,
  UPCOMING_FAR,
  UPCOMING_SOON,
  FINISHED,
}

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
  matchState: MatchState;

  updateImpuls = toSignal(this.timerService.halfMinuteTick$);
  currentBatchContent = signal<string>('');
  currentScoreContent = signal<string>('');

  constructor() {
    effect(() => {
      if (this.updateImpuls()) {
        this.matchState = this.calculateMatchState();
        this.currentBatchContent.set(this.getBatchContent());
        this.currentScoreContent.set(this.getScoreContent());
      }
    });
  }

  ngOnInit() {
    this.matchState = this.calculateMatchState();
    this.currentBatchContent.set(this.getBatchContent());
    this.currentScoreContent.set(this.getScoreContent());
  }

  calculateMatchState() {
    const kickOfTime = new Date(this.match().scheduledDateTime);
    if (kickOfTime.getTime() > Date.now() + 1000 * 60 * 60) {
      return MatchState.UPCOMING_FAR;
    } else if (kickOfTime.getTime() > Date.now()) {
      return MatchState.UPCOMING_SOON;
    } else if (!this.match().isFinished) {
      return MatchState.LIVE;
    } else {
      return MatchState.FINISHED;
    }
  }

  getScoreContent() {
    const kickOfTime = new Date(this.match().scheduledDateTime);
    switch (this.matchState) {
      case MatchState.UPCOMING_SOON:
      case MatchState.UPCOMING_FAR:
        return this.datePipe.transform(kickOfTime, 'HH:mm') || '';

      case MatchState.LIVE:
      case MatchState.FINISHED:
        return `${this.match().scores.homeTeamScore}:${this.match().scores.awayTeamScore}`;
    }
  }

  getBatchContent() {
    switch (this.matchState) {
      case MatchState.LIVE:
        return 'Live';
      case MatchState.FINISHED:
        return 'Beendet';

      case MatchState.UPCOMING_SOON: {
        const kickOfTime = new Date(this.match().scheduledDateTime);
        return `In ${this.getLiveCountdown(kickOfTime)} min`;
      }

      default:
        return '';
    }
  }

  getLiveCountdown(targetDate: Date): number {
    return Math.ceil((targetDate.getTime() - Date.now()) / 60000);
  }

  MatchState = MatchState;
}
