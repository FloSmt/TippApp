import { Component, effect, inject } from '@angular/core';

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
import { close, closeCircle, informationCircleOutline, shieldCheckmark, textOutline, trophy } from 'ionicons/icons';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmPasswordValidator, TipgroupStore, TransformLeagueNamePipe } from '@tippapp/frontend/utils';
import { CreateTipgroupDto, LeagueOverviewResponseDto } from '@tippapp/shared/data-access';
import { ErrorCardTemplateComponent } from '@tippapp/frontend/shared-components';

@Component({
  selector: 'lib-create-matchday.dialog',
  imports: [
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
    TransformLeagueNamePipe,
  ],
  templateUrl: './create-tipgroup.dialog.component.html',
  styleUrl: './create-tipgroup.dialog.component.scss',
})
export class CreateTipgroupDialogComponent {
  readonly modalController = inject(ModalController);
  readonly tipgroupStore = inject(TipgroupStore);

  readonly noSelectionValue = 'no_selection';
  readonly nameMaxLength = 50;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(this.nameMaxLength)]),
    selectedLeague: new FormControl(this.noSelectionValue, [Validators.required]),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [Validators.required, confirmPasswordValidator('password')]),
  });

  constructor() {
    addIcons({
      close,
      closeCircle,
      informationCircleOutline,
      textOutline,
      shieldCheckmark,
      trophy,
    });

    this.tipgroupStore.loadAvailableLeagues();

    effect(() => {
      if (!this.isLoadingCreateTipgroup() && !this.tipgroupStore.createTipgroupState.error()) {
        this.modalController.dismiss(null, 'created');
      }
    });
  }

  isLoadingAvailableLeagues = this.tipgroupStore.availableLeaguesState.isLoading;
  isLoadingCreateTipgroup = this.tipgroupStore.createTipgroupState.isLoading;
  availableLeagues = this.tipgroupStore.availableLeaguesState;
  hasAvailableLeaguesError = this.tipgroupStore.hasAvailableLeaguesError;

  disableCreateButton() {
    return (
      !this.createForm.valid ||
      this.isLoadingAvailableLeagues() ||
      this.hasAvailableLeaguesError() ||
      this.createForm.get('selectedLeague')?.value === this.noSelectionValue
    );
  }

  cancel() {
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

    const league = this.availableLeagues.data()?.find((league) => league.leagueId === leagueId);
    return league ? { shortcut: league.leagueShortcut, season: Number(league.leagueSeason) } : null;
  }

  getLeagueSeasonGroups(): LeagueSeasonGroup[] {
    const leagues =
      this.availableLeagues.data()?.filter((league) => Number(league.leagueSeason) >= new Date().getFullYear() - 1) ||
      [];
    const seasonGroups: { [key: number]: LeagueOverviewResponseDto[] } = {};

    leagues.forEach((league) => {
      if (!seasonGroups[league.leagueSeason]) {
        seasonGroups[league.leagueSeason] = [];
      }
      seasonGroups[league.leagueSeason].push(league);
    });

    return Object.keys(seasonGroups)
      .map((season) => ({
        season: Number(season),
        leagues: seasonGroups[Number(season)].sort((a, b) => a.leagueName.localeCompare(b.leagueName)),
      }))
      .sort((a, b) => b.season - a.season); // Sort seasons in descending order
  }

  getErrorMessage(controlName: string): string {
    const control = this.createForm.get(controlName);
    if (control?.hasError('required')) {
      return `Dieses Feld ist erforderlich.`;
    }
    if (control?.hasError('maxlength')) {
      return `Name darf maximal ${control.errors?.['maxlength'].requiredLength} Zeichen lang sein.`;
    }
    if (control?.hasError('minlength')) {
      return controlName === 'name'
        ? `Name muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`
        : `Passwort muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`;
    }

    if (control?.hasError('passwordMismatch')) {
      return 'Die Passwörter stimmen nicht überein.';
    }

    if (control?.hasError('backendError')) {
      // return this.errorManagagementService.getMessageForValidationError(
      //   control.errors?.['backendError'] as ApiValidationErrorMessage
      // );
    }

    return '';
  }
}

export interface LeagueSeasonGroup {
  season: number;
  leagues: LeagueOverviewResponseDto[];
}
