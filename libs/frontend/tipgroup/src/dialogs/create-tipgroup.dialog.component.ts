import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, closeCircle, informationCircleOutline } from 'ionicons/icons';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipgroupStore } from '@tippapp/frontend/utils';
import { CreateTipgroupDto } from '@tippapp/shared/data-access';
import { ErrorCardTemplateComponent } from '../../../shared/components/src/template-cards/error-card/error-card.template.component';

@Component({
  selector: 'lib-create-tipgroup.dialog',
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonInput,
    IonIcon,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonInputPasswordToggle,
    ReactiveFormsModule,
    IonLabel,
    IonSpinner,
    ErrorCardTemplateComponent,
  ],
  templateUrl: './create-tipgroup.dialog.component.html',
  styleUrl: './create-tipgroup.dialog.component.scss',
})
export class CreateTipgroupDialogComponent {
  readonly modalController = inject(ModalController);
  readonly tipgroupStore = inject(TipgroupStore);

  constructor() {
    addIcons({ close, closeCircle, informationCircleOutline });

    this.tipgroupStore.loadAvailableLeagues();
  }

  isLoading = this.tipgroupStore.isLoading;
  availableLeagues = this.tipgroupStore.availableLeagues;
  hasAvailableLeaguesError = this.tipgroupStore.hasAvailableLeaguesError;

  createForm = new FormGroup({
    name: new FormControl('', Validators.required),
    selectedLeague: new FormControl('no_selection', Validators.required),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', Validators.required),
  });

  disableCreateButton() {
    return (
      !this.createForm.valid ||
      this.isLoading() ||
      this.hasAvailableLeaguesError()
    );
  }

  cancel() {
    console.log('Cancel clicked');
    return this.modalController.dismiss(null, 'cancel');
  }

  async createTipgroup() {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const league = this.getSelectedLeague();

      if (!league) {
        this.createForm.setErrors(new Error('Please select a valid league.'));
        return;
      }

      const createTipgroupDto: CreateTipgroupDto = {
        name: formValue.name ? formValue.name : '',
        leagueShortcut: league.shortcut,
        password: formValue.password ? formValue.password : '',
        currentSeason: league.season,
      };

      this.tipgroupStore.createTipgroup({ createTipgroupDto });
    }
  }

  getSelectedLeague(): { shortcut: string; season: number } | null {
    const leagueId = Number(this.createForm.value.selectedLeague);

    const league = this.availableLeagues
      .data()
      ?.find((league) => league.leagueId === leagueId);
    return league
      ? { shortcut: league.leagueShortcut, season: league.leagueSeason }
      : null;
  }
}
