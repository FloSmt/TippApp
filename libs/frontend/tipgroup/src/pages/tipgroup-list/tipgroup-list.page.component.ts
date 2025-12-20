import { Component, computed, inject, OnInit } from '@angular/core';
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
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { banOutline, chevronForwardOutline, closeCircleOutline, people } from 'ionicons/icons';
import { Router } from '@angular/router';
import { LoadingState, TipgroupStore } from '@tippapp/frontend/utils';
import { NgTemplateOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise, take } from 'rxjs';
import { ErrorCardTemplateComponent } from '@tippapp/frontend/shared-components';
import { CreateTipgroupDialogComponent } from '../../dialogs/create-tipgroup.dialog.component';

@Component({
  selector: 'lib-matchday-list',
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
    ErrorCardTemplateComponent,
  ],
  templateUrl: './tipgroup-list.page.component.html',
  styleUrl: './tipgroup-list.page.component.scss',
})
export class TipgroupListPageComponent implements OnInit {
  readonly router = inject(Router);
  readonly tipgroupStore = inject(TipgroupStore);
  readonly modalController = inject(ModalController);

  isLoadingAfterRefresh$ = toObservable(this.tipgroupStore.isLoadingTipgroups);
  availableTipgroups = this.tipgroupStore.availableTipgroupsState.data;
  isLoading = this.tipgroupStore.isLoadingTipgroups;
  hasError = this.tipgroupStore.hasErrorOnLoadingTipgroups;
  initialLoading = computed(() => this.tipgroupStore.availableTipgroupsState.loadingState() === LoadingState.INITIAL);

  constructor() {
    addIcons({ chevronForwardOutline, people, closeCircleOutline, banOutline });
  }

  ngOnInit(): void {
    this.tipgroupStore.loadAvailableTipgroups({ reload: false });
  }

  async refreshTipgroups(event: any) {
    this.tipgroupStore.loadAvailableTipgroups({ reload: true });

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

  async openCreateTipgroupDialog() {
    const modal = await this.modalController.create({
      component: CreateTipgroupDialogComponent,
    });

    await modal.present();
  }
}
