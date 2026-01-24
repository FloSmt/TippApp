import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { IonContent, IonItem, IonRadio, IonRadioGroup, ModalController } from '@ionic/angular/standalone';
import { HeaderContentCondenseComponent } from '@tippapp/frontend/shared-components';

@Component({
  selector: 'lib-select-matchday.dialog',
  imports: [IonContent, IonItem, IonRadio, IonRadioGroup, HeaderContentCondenseComponent],
  templateUrl: './select-matchday.dialog.component.html',
  styleUrl: './select-matchday.dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMatchdayDialogComponent {
  private readonly modalController = inject(ModalController);

  @Input({ required: true }) allMatchdays: MatchdayOverviewResponseDto[];
  @Input({ required: true }) currentSelectedId: number;

  handleSelection(matchdayId: number) {
    return this.modalController.dismiss({ selectedMatchdayId: matchdayId }, 'selected');
  }
}
