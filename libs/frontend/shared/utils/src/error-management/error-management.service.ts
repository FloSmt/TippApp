import { inject, Injectable } from '@angular/core';
import { ApiValidationErrorMessage } from '@tippapp/shared/data-access';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ErrorManagementService {
  private toastController = inject(ToastController);

  handleValidationError(
    error: HttpErrorResponse
  ): ApiValidationErrorMessage[] | null {
    if (error.status === 422 && error.error && error.error.validationMessages) {
      return error.error.validationMessages;
    } else if (error.error.code) {
      this.showToastMessage(error.error.code);
      return null;
    }

    this.showToastMessage('Unexpected error.');
    return null;
  }

  showToastMessage(message: string) {
    this.toastController
      .create({
        message: message,
        duration: 3000,
        position: 'bottom',
      })
      .then((toast) => {
        toast.present();
      });
  }
}
