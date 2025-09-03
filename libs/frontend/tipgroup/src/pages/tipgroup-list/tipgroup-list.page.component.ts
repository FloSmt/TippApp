import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { addIcons } from 'ionicons';
import {
  banOutline,
  chevronForwardOutline,
  closeCircleOutline,
  people,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { TipgroupStore } from '@tippapp/frontend/utils';
import { NgTemplateOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise, take } from 'rxjs';

@Component({
  selector: 'lib-tipgroup-list',
  imports: [
    FormsModule,
    IonContent,
    IonItemGroup,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    IonHeader,
    IonToolbar,
    NgTemplateOutlet,
  ],
  templateUrl: './tipgroup-list.page.component.html',
  styleUrl: './tipgroup-list.page.component.scss',
})
export class TipgroupListPageComponent implements OnInit {
  readonly router = inject(Router);
  readonly tipgroupStore = inject(TipgroupStore);

  isLoadingAfterRefresh$ = toObservable(this.tipgroupStore.isLoading);
  availableTipgroups = this.tipgroupStore.availableTipgroups;
  isLoading = this.tipgroupStore.isLoading;
  hasError = this.tipgroupStore.hasError;

  constructor() {
    addIcons({ chevronForwardOutline, people, closeCircleOutline, banOutline });
  }

  ngOnInit(): void {
    this.tipgroupStore.loadAvailableTipgroups();
  }

  async refreshTipgroups(event: any) {
    this.tipgroupStore.loadAvailableTipgroups();

    this.isLoadingAfterRefresh$
      .pipe(
        pairwise(),
        filter(([previous, current]) => previous === true && current === false),
        take(1)
      )
      .subscribe(() => {
        event.target.complete();
      });
  }
}
