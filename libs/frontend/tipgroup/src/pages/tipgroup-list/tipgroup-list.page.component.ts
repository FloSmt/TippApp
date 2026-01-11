import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { banOutline, chevronForwardOutline, closeCircleOutline, people } from 'ionicons/icons';
import { Router } from '@angular/router';
import { LoadingState, TipgroupManagementStore } from '@tippapp/frontend/utils';
import { NgTemplateOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise, take } from 'rxjs';
import {
  CustromHeaderComponent,
  ErrorCardTemplateComponent,
  HeaderContentCondenseComponent
} from '@tippapp/frontend/shared-components';
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
    NgTemplateOutlet,
    ErrorCardTemplateComponent,
    CustromHeaderComponent,
    HeaderContentCondenseComponent,
  ],
  templateUrl: './tipgroup-list.page.component.html',
  styleUrl: './tipgroup-list.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipgroupListPageComponent implements OnInit {
  readonly router = inject(Router);
  readonly tipgroupStore = inject(TipgroupManagementStore);
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
    try {
      const modal = await this.modalController.create({
        component: CreateTipgroupDialogComponent,
      });

      await modal.present();
    } catch (error) {
      console.error(error);
    }
  }
}
