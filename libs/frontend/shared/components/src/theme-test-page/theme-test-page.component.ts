import {Component, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {add, close, library, personCircle, playCircle, radio, search,} from 'ionicons/icons';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from "@tippapp/frontend/utils";
import {TipgroupResponseDto} from "@tippapp/shared/data-access";

@Component({
  selector: 'lib-theme-test-page',
  imports: [
    CommonModule,
    IonIcon,
    IonTab,
    IonTabs,
    IonContent,
    IonTabBar,
    IonTabButton,
    IonButton,
    IonCheckbox,
    IonChip,
    IonLabel,
    IonFab,
    IonFabButton,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    IonToggle,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonHeader,
  ],
  templateUrl: './theme-test-page.component.html',
  styleUrl: './theme-test-page.component.scss',
})
export class ThemeTestPageComponent {
  protected testResponse: WritableSignal<TipgroupResponseDto | undefined> = signal(undefined);

  constructor(public authService: AuthService) {
    addIcons({playCircle, radio, library, search, close, add, personCircle});
  }

  testRequest() {
    this.authService.testRequest().subscribe();
  }
}
