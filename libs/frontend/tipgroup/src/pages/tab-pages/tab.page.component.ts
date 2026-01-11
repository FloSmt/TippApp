import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albums, barChart, dice, person, podium } from 'ionicons/icons';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';

@Component({
  selector: 'lib-tab.page',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonContent],
  templateUrl: './tab.page.component.html',
  styleUrl: './tab.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageComponent implements OnInit {
  private readonly tipgroupDetailsStore = inject(TipgroupDetailsStore);

  constructor() {
    addIcons({ albums, podium, dice, barChart, person });
  }

  @Input() tipgroupId!: number;

  ngOnInit(): void {
    this.tipgroupDetailsStore.loadInitialData({ tipgroupId: this.tipgroupId });
  }
}
