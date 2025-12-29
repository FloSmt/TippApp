import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { MatchResponseDto } from '@tippapp/shared/data-access';
import { TimerService } from '@tippapp/frontend/utils';
import { toSignal } from '@angular/core/rxjs-interop';

enum MatchState {
  LIVE,
  UPCOMING_FAR,
  UPCOMING_SOON,
  FINISHED,
}

@Component({
  selector: 'lib-match-card',
  imports: [],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent implements OnInit {
  private readonly timerService = inject(TimerService);

  match = input.required<MatchResponseDto>();
  matchState: MatchState;

  updateImpuls = toSignal(this.timerService.minuteTick$);
  currentSubString = signal<string>('');

  constructor() {
    effect(() => {
      if (this.updateImpuls()) {
        this.matchState = this.calculateMatchState();
        this.currentSubString.set(this.getScoreContent());
      }
    });
  }

  ngOnInit() {
    this.matchState = this.calculateMatchState();
    this.currentSubString.set(this.getScoreContent());
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
      case MatchState.UPCOMING_FAR:
        return `${kickOfTime.getHours()}:${kickOfTime.getMinutes()}`;
      case MatchState.UPCOMING_SOON:
        return this.getLiveCountdown(kickOfTime);
      case MatchState.LIVE:
      case MatchState.FINISHED:
        return `${this.match().scores.homeTeamScore}:${this.match().scores.awayTeamScore}`;
    }
  }

  getScoreSubContent() {
    switch (this.matchState) {
      case MatchState.LIVE:
      case MatchState.FINISHED:
        return '0:3';

      case MatchState.UPCOMING_SOON:
        return 'Minuten';

      default:
        return '';
    }
  }

  getLiveCountdown(targetDate: Date): string {
    const diffMins = Math.ceil((targetDate.getTime() - Date.now()) / 60000);
    return `${diffMins}`;
  }

  MatchState = MatchState;
}
