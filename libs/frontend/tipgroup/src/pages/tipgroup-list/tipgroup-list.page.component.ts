import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, people } from 'ionicons/icons';

@Component({
  selector: 'lib-tipgroup-list',
  imports: [FormsModule, IonContent, IonItemGroup, IonItem, IonIcon, IonLabel],
  templateUrl: './tipgroup-list.page.component.html',
  styleUrl: './tipgroup-list.page.component.scss',
})
export class TipgroupListPageComponent {
  readonly tipgroups = [
    { id: '1', name: 'Tipgruppe A', memberCount: 5 },
    { id: '2', name: 'Tipgruppe B', memberCount: 3 },
    { id: '3', name: 'Tipgruppe C', memberCount: 8 },
  ];

  constructor() {
    addIcons({ chevronForwardOutline, people });
  }
}
