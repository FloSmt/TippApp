import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { IonBadge, IonContent, IonItem, IonRadio, IonRadioGroup, ModalController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'lib-select-matchday.dialog',
  providers: [DatePipe],
  imports: [IonContent, IonItem, IonRadio, IonRadioGroup, IonBadge],
  templateUrl: './select-matchday.dialog.component.html',
  styleUrl: './select-matchday.dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMatchdayDialogComponent {
  private readonly modalController = inject(ModalController);
  private readonly date = inject(DatePipe);

  @Input({ required: true }) allMatchdays: MatchdayOverviewResponseDto[];
  @Input({ required: true }) currentMatchdayId: number;
  @Input({ required: true }) selectedMatchdayId: number;

  handleSelection(matchdayId: number) {
    return this.modalController.dismiss({ selectedMatchdayId: matchdayId }, 'selected');
  }

  getMatchdayDate(matchday: MatchdayOverviewResponseDto): string | null {
    if (!matchday.startDate || !matchday.endDate) {
      return null;
    }

    if (matchday.startDate === matchday.endDate) {
      return this.date.transform(matchday.startDate, 'dd.MM.') ?? null;
    } else {
      const startDate = this.date.transform(matchday.startDate, 'dd.MM.') ?? null;
      const endDate = this.date.transform(matchday.endDate, 'dd.MM.') ?? null;
      return `${startDate} - ${endDate}`;
    }
  }
}
