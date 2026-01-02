import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { IonContent, IonRefresher, IonRefresherContent, IonSkeletonText, IonSpinner } from '@ionic/angular/standalone';
import {
  CustromHeaderComponent,
  ErrorCardTemplateComponent,
  MatchCardComponent,
  MatchdaySelectorComponent,
} from '@tippapp/frontend/shared-components';
import { MatchResponseDto } from '@tippapp/shared/data-access';
import { addIcons } from 'ionicons';
import { today } from 'ionicons/icons';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise, take } from 'rxjs';

interface DateGroup {
  dateLabel: string;
  matchList: MatchResponseDto[];
}

@Component({
  selector: 'lib-overview.page',
  imports: [
    IonSpinner,
    IonContent,
    MatchdaySelectorComponent,
    MatchCardComponent,
    CustromHeaderComponent,
    NgTemplateOutlet,
    IonSkeletonText,
    ErrorCardTemplateComponent,
    IonRefresher,
    IonRefresherContent,
  ],
  templateUrl: './overview.page.component.html',
  styleUrl: './overview.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class OverviewPageComponent {
  private readonly tipgroupDetailsStore = inject(TipgroupDetailsStore);
  private readonly datePipe = inject(DatePipe);

  isLoading = this.tipgroupDetailsStore.isLoading();

  currentMatchday = this.tipgroupDetailsStore.getCurrentMatchday;
  hasError = this.tipgroupDetailsStore.hasError;
  isReloadingMatchday$ = toObservable(this.tipgroupDetailsStore.isReloadingMatchday);
  tipgroupDetails = this.tipgroupDetailsStore.getTipgroupDetails;
  currentMatchdayId = this.tipgroupDetailsStore.getSelectedMatchdayId();
  matchdayOverview = this.tipgroupDetailsStore.getMatchdayOverview();

  groupedMatchdays: { live: MatchResponseDto[]; upcoming: DateGroup[]; finished: DateGroup[] };

  // Used to hide header on scroll
  scrollData: any;

  handleMatchdayIdChange(id: number | null) {
    this.tipgroupDetailsStore.loadMatchdayDetails({ matchdayId: id, reload: false });
  }

  constructor() {
    addIcons({ today });
    effect(() => {
      if (this.currentMatchday() !== null && this.currentMatchday()?.matchList) {
        this.groupedMatchdays = this.groupMatches(this.currentMatchday()!.matchList);
      }
    });
  }

  refreshMatchday(event: any) {
    this.tipgroupDetailsStore.loadMatchdayDetails({ matchdayId: this.currentMatchdayId(), reload: true });

    this.isReloadingMatchday$
      .pipe(
        pairwise(),
        filter(([previous, current]) => previous === true && current === false),
        take(1)
      )
      .subscribe(() => {
        event.target.complete();
      });
  }

  groupMatches(matches: MatchResponseDto[]) {
    const now = new Date();

    const live = matches.filter((g) => !g.isFinished && new Date(g.scheduledDateTime) <= now);
    const upcoming = this.groupByDate(
      matches.filter((g) => !g.isFinished && new Date(g.scheduledDateTime) > now),
      'asc'
    );
    const finished = this.groupByDate(
      matches.filter((g) => g.isFinished),
      'asc'
    );

    return { live, upcoming, finished };
  }

  private groupByDate(games: MatchResponseDto[], sortOrder: 'asc' | 'desc'): DateGroup[] {
    const sorted = [...games].sort((a, b) => {
      const startDateA = new Date(a.scheduledDateTime);
      const startDateB = new Date(b.scheduledDateTime);

      return sortOrder === 'asc'
        ? startDateA.getTime() - startDateB.getTime()
        : startDateB.getTime() - startDateA.getTime();
    });

    const groups = sorted.reduce((acc: DateGroup[], game) => {
      const startDate = new Date(game.scheduledDateTime);

      const dateLabel = this.datePipe.transform(startDate, 'dd.MM.yyyy') || '';
      const existingGroup = acc.find((g) => g.dateLabel === dateLabel);

      if (existingGroup) {
        existingGroup.matchList.push(game);
      } else {
        acc.push({ dateLabel, matchList: [game] });
      }
      return acc;
    }, []);

    return groups;
  }
}
