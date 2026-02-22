import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import { caretBack, caretForward, chevronDownOutline } from 'ionicons/icons';
import { IonIcon, IonSkeletonText, ModalController } from '@ionic/angular/standalone';
import { MatchdayDetailsResponseDto, MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { SelectMatchdayDialogComponent } from './select-dialog/select-matchday.dialog.component';

@Component({
  selector: 'lib-matchday-selector',
  imports: [IonIcon, IonSkeletonText],
  templateUrl: './matchday-selector.component.html',
  styleUrl: './matchday-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchdaySelectorComponent {
  readonly modalController = inject(ModalController);

  allMatchdays = input<MatchdayOverviewResponseDto[] | null>(null);
  selectedMatchday = input<MatchdayDetailsResponseDto | null>(null);
  currentMatchdayId = input<number | null>(null);
  selectedMatchdayId = model<number | null>(null);
  disableSelection = input<boolean>(false);

  sortedMatchdays: MatchdayOverviewResponseDto[] = [];

  isOpen = signal(false);

  isFirstSelected = computed(() => {
    if (this.sortedMatchdays.length === 0) {
      return true;
    }

    return this.selectedMatchdayId() === this.sortedMatchdays[0].matchdayId;
  });

  isLastSelected = computed(() => {
    if (this.sortedMatchdays.length === 0) {
      return true;
    }

    return this.selectedMatchdayId() === this.sortedMatchdays[this.sortedMatchdays.length - 1].matchdayId;
  });

  getMatchdayName = computed(() => {
    const matchdayObject = this.sortedMatchdays.find(
      (matchday) => matchday.matchdayId.toString() === this.selectedMatchdayId()?.toString()
    );
    return matchdayObject?.name;
  });

  constructor() {
    addIcons({ caretForward, caretBack, chevronDownOutline });
    effect(() => {
      if (this.allMatchdays() !== null) {
        this.sortedMatchdays = this.allMatchdays()!.sort((a, b) => a.orderId - b.orderId);
      }
    });
  }

  async selectNextEntry() {
    if (this.isLastSelected() || this.sortedMatchdays.length === 0) {
      return;
    }

    const currentIndex = this.sortedMatchdays.findIndex(
      (t) => t.matchdayId.toString() === this.selectedMatchdayId()?.toString()
    );
    const nextId = this.sortedMatchdays[currentIndex + 1].matchdayId;
    this.selectedMatchdayId.set(nextId);
  }

  async selectPreviousEntry() {
    if (this.isFirstSelected() || this.sortedMatchdays.length === 0) {
      return;
    }

    const currentIndex = this.sortedMatchdays.findIndex(
      (t) => t.matchdayId.toString() === this.selectedMatchdayId()?.toString()
    );
    this.selectedMatchdayId.set(this.sortedMatchdays[currentIndex - 1].matchdayId);
  }

  async openSelectionDialog() {
    if (this.disableSelection()) {
      return;
    }

    const modal = await this.modalController.create({
      component: SelectMatchdayDialogComponent,
      componentProps: {
        allMatchdays: this.sortedMatchdays,
        selectedMatchdayId: this.selectedMatchdayId(),
        currentMatchdayId: this.currentMatchdayId(),
      },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });

    this.isOpen.set(true);
    await modal.present();

    modal.onWillDismiss().then(({ role, data }) => {
      this.isOpen.set(false);

      if (role === 'selected') {
        this.selectedMatchdayId.set(data.selectedMatchdayId);
      }
    });
  }
}
