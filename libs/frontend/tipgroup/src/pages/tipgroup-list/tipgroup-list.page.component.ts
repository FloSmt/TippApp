import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {chevronForwardOutline, people} from 'ionicons/icons';
import {Router} from "@angular/router";

@Component({
  selector: 'lib-tipgroup-list',
  imports: [FormsModule, IonContent, IonItemGroup, IonItem, IonIcon, IonLabel, IonButton, IonFooter, IonRefresher, IonRefresherContent, IonHeader, IonToolbar],
  templateUrl: './tipgroup-list.page.component.html',
  styleUrl: './tipgroup-list.page.component.scss',
})
export class TipgroupListPageComponent {
  readonly router = inject(Router);

  readonly tipgroups = [
    {id: 1, name: 'Tipgruppe A', memberCount: 5},
    {id: 2, name: 'Tipgruppe B', memberCount: 3},
    {id: 3, name: 'Tipgruppe C', memberCount: 8},
  ];

  constructor() {
    addIcons({chevronForwardOutline, people});
  }

  navigateToMainPage(tipgroupId: number) {
    this.router.navigate(['/overview', tipgroupId]);
  }
}
