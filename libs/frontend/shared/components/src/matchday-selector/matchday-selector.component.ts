import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { addIcons } from 'ionicons';
import { caretBack, caretDown, caretForward } from 'ionicons/icons';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { MatchdayDetailsResponseDto, MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { SelectMatchdayDialogComponent } from './select-dialog/select-matchday.dialog.component';

@Component({
  selector: 'lib-matchday-selector',
  imports: [IonIcon],
  templateUrl: './matchday-selector.component.html',
  styleUrl: './matchday-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchdaySelectorComponent implements OnInit {
  readonly modalController = inject(ModalController);

  allMatchdays = input.required<MatchdayOverviewResponseDto[]>();
  currentMatchday = input.required<MatchdayDetailsResponseDto>();
  selectedMatchdayId = output<number>();

  sortedMatchdays: MatchdayOverviewResponseDto[] = [];

  constructor() {
    addIcons({ caretForward, caretBack, caretDown });
  }

  ngOnInit() {
    this.sortMatchdays();
  }

  sortMatchdays() {
    this.sortedMatchdays = this.allMatchdays().sort((a, b) => a.orderId - b.orderId);
  }

  async openSelectionDialog() {
    const modal = await this.modalController.create({
      component: SelectMatchdayDialogComponent,
      componentProps: { allMatchdays: this.sortedMatchdays, currentSelectedId: this.currentMatchday().matchdayId },
      breakpoints: [0.75, 1],
      initialBreakpoint: 0.75,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'selected') {
      this.selectedMatchdayId.emit(data.selectedMatchdayId);
    }
  }

  isFirstEntrySelected(): boolean {
    if (this.allMatchdays().length === 0) {
      return true;
    }

    return this.currentMatchday().matchdayId === this.sortedMatchdays[0].matchdayId;
  }

  isLastEntrySelected(): boolean {
    if (this.allMatchdays().length === 0) {
      return true;
    }

    return this.currentMatchday().matchdayId === this.sortedMatchdays[this.sortedMatchdays.length - 1].matchdayId;
  }
}
