import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { MatchdaySelectorComponent } from '@tippapp/frontend/shared-components';

@Component({
  selector: 'lib-overview.page',
  imports: [IonSpinner, IonContent, MatchdaySelectorComponent],
  templateUrl: './overview.page.component.html',
  styleUrl: './overview.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent {
  private readonly tipgroupDetailsStore = inject(TipgroupDetailsStore);

  isLoadingDetails = this.tipgroupDetailsStore.isLoading().tipgroupDetails;
  isLoadingMatchdayData = this.tipgroupDetailsStore.isLoading().matchdayData;

  currentMatchday = this.tipgroupDetailsStore.getCurrentMatchday();
  matchdayOverview = this.tipgroupDetailsStore.getMatchdayOverview();

  handleMatchdayChange(newMatchdayId: number) {
    console.log('handleMatchdayChange', newMatchdayId);
  }
}
