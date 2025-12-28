import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { MatchCardComponent, MatchdaySelectorComponent } from '@tippapp/frontend/shared-components';

@Component({
  selector: 'lib-overview.page',
  imports: [IonSpinner, IonContent, MatchdaySelectorComponent, MatchCardComponent],
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
}
