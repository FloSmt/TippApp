import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { MatchCardComponent, MatchdaySelectorComponent } from '@tippapp/frontend/shared-components';
import { MatchResponseDto } from '@tippapp/shared/data-access';
import { addIcons } from 'ionicons';
import { today } from 'ionicons/icons';

interface DateGroup {
  dateLabel: string;
  matchList: MatchResponseDto[];
}

@Component({
  selector: 'lib-overview.page',
  imports: [IonSpinner, IonContent, MatchdaySelectorComponent, MatchCardComponent, IonIcon],
  templateUrl: './overview.page.component.html',
  styleUrl: './overview.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent {
  private readonly tipgroupDetailsStore = inject(TipgroupDetailsStore);

  isLoading = this.tipgroupDetailsStore.isLoading();

  currentMatchday = this.tipgroupDetailsStore.getCurrentMatchday;
  currentMatchdayId = this.tipgroupDetailsStore.getSelectedMatchdayId();
  matchdayOverview = this.tipgroupDetailsStore.getMatchdayOverview();

  handleMatchdayIdChange(id: number | null) {
    this.tipgroupDetailsStore.loadMatchdayDetails(id);
  }

  groupedMatchdays: { live: MatchResponseDto[]; upcoming: DateGroup[]; finished: DateGroup[] };

  constructor() {
    addIcons({ today });
    effect(() => {
      if (this.currentMatchday() !== null && this.currentMatchday()?.matchList) {
        this.groupedMatchdays = this.groupMatches(this.currentMatchday()!.matchList);
      }
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

      const dateLabel = startDate.toLocaleDateString('de-DE');
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
