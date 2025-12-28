import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { IonContent, IonItem, IonItemGroup, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'lib-select-matchday.dialog',
  imports: [IonContent, IonItemGroup, IonItem],
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
