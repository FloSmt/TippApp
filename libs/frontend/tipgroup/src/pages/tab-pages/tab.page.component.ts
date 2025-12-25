import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albums, dice, menu, podium } from 'ionicons/icons';

@Component({
  selector: 'lib-tab.page',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './tab.page.component.html',
  styleUrl: './tab.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageComponent {
  constructor() {
    addIcons({ albums, podium, dice, menu });
  }

  public tipgroupId = 1;
}
