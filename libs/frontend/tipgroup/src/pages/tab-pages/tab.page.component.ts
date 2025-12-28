import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSkeletonText,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albums, barChart, dice, person, podium } from 'ionicons/icons';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';

@Component({
  selector: 'lib-tab.page',
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonButton,
    IonButtons,
    IonHeader,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    IonContent,
  ],
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

  tipgroupDetails = this.tipgroupDetailsStore.getTipgroupDetails();
  isLoadingDetails = this.tipgroupDetailsStore.isLoading().tipgroupDetails;

  ngOnInit(): void {
    this.tipgroupDetailsStore.loadInitialData({ tipgroupId: this.tipgroupId });
  }
}
