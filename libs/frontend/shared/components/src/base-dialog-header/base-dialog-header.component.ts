import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { CustromHeaderComponent } from '../custom-components';

@Component({
  selector: 'lib-base-dialog-header',
  imports: [IonButton, IonButtons, IonHeader, IonIcon, IonToolbar, ReactiveFormsModule, CustromHeaderComponent],
  templateUrl: './base-dialog-header.component.html',
  styleUrl: './base-dialog-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDialogHeaderComponent {
  cancelEvent = output<boolean>();
  title = input('');
  showCancelButton = input(true);

  constructor() {
    addIcons({
      close,
    });
  }

  onCancel() {
    this.cancelEvent.emit(true);
  }
}
