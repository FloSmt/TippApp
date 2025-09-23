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
import { close, informationCircleOutline } from 'ionicons/icons';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipgroupStore } from '@tippapp/frontend/utils';
import { CreateTipgroupDto } from '@tippapp/shared/data-access';

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
  ],
  templateUrl: './create-tipgroup.dialog.component.html',
  styleUrl: './create-tipgroup.dialog.component.scss',
})
export class CreateTipgroupDialogComponent {
  readonly modalController = inject(ModalController);
  readonly tipgroupStore = inject(TipgroupStore);

  constructor() {
    addIcons({ close, informationCircleOutline });
  }

  isLoading = this.tipgroupStore.isLoading;

  createForm = new FormGroup({
    name: new FormControl('', Validators.required),
    selectedLeague: new FormControl('no_selection', Validators.required),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', Validators.required),
  });

  disableCreateButton() {
    return !this.createForm.valid || this.isLoading();
  }

  cancel() {
    console.log('Cancel clicked');
    return this.modalController.dismiss(null, 'cancel');
  }

  async createTipgroup() {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const createTipgroupDto: CreateTipgroupDto = {
        name: formValue.name!,
        leagueShortcut: formValue.selectedLeague!,
        password: formValue.password!,
        currentSeason: 2025,
      };
      this.tipgroupStore.createTipgroup({ createTipgroupDto });
      // await this.modalController.dismiss(formValue, 'create');
    }
  }
}
