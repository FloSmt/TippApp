import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, checkmarkCircle, closeCircle } from 'ionicons/icons';

export enum NotificationType {
  INFO,
  ERROR,
  SUCCESS,
}

export interface NotificationInput {
  header?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ alertCircle, checkmarkCircle, closeCircle });
  }

  showTypeMessage(
    notificationInput: NotificationInput,
    notificationType: NotificationType
  ) {
    switch (notificationType) {
      case NotificationType.ERROR:
        this.showMessage(
          { ...notificationInput, duration: 6000 },
          'toast-error',
          closeCircle
        );
        break;

      case NotificationType.INFO:
        this.showMessage(
          { ...notificationInput, duration: 6000 },
          'toast-info',
          alertCircle
        );
        break;

      case NotificationType.SUCCESS:
        this.showMessage(
          { ...notificationInput, duration: 3000 },
          'toast-success',
          checkmarkCircle
        );
    }
  }

  private showMessage(
    notificationInput: NotificationInput,
    cssClass: string,
    iconName: string
  ) {
    this.toastController
      .create({
        header: notificationInput.header,
        message: notificationInput.message,
        duration: notificationInput.duration,
        position: 'bottom',
        icon: iconName,
        positionAnchor: 'footer',
        cssClass: 'toast-message ' + cssClass,
        swipeGesture: 'vertical',
      })
      .then((toast) => {
        toast.present();
      });
  }
}
