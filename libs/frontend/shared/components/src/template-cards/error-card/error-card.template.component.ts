import { Component, input } from '@angular/core';

import { IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';

@Component({
  selector: 'lib-error-card',
  imports: [IonItem, IonLabel, IonIcon],
  templateUrl: './error-card.template.component.html',
  styleUrl: './error-card.template.component.scss',
})
export class ErrorCardTemplateComponent {
  title = input.required();
  message = input.required();

  constructor() {
    addIcons({ closeCircle });
  }
}
