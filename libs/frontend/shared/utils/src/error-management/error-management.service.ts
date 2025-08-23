import {inject, Injectable} from '@angular/core';
import {ApiValidationErrorMessage} from '@tippapp/shared/data-access';
import {HttpErrorResponse} from "@angular/common/http";
import {ToastController} from "@ionic/angular/standalone";

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
      this.showToastMessage(this.getMessageForErrorCode(error.error.code));
      return null;
    }

    this.showToastMessage(
      'Unbekannter Fehler ist aufgetreten. Versuche es später erneut.'
    );
    return null;
  }

  showToastMessage(message: string) {
    this.toastController
      .create({
        message: message,
        duration: 6000,
        position: 'bottom',
      })
      .then((toast) => {
        toast.present();
      });
  }

  getMessageForErrorCode(errorCode: string): string {
    switch (errorCode) {
      case 'AUTH.EMAIL_ALREADY_EXISTS':
        return 'Email exisistiert bereits.';
      case 'AUTH.USER_NOT_FOUND':
        return 'Nutzer wurde nicht gefunden.';
      case 'AUTH.INVALID_CREDENTIALS':
        return 'Passwort und Nutzername stimmen nicht überein.';
      case 'AUTH.INVALID_REFRESH_TOKEN':
        return 'Ihre Session ist abgelaufen. Bitte melden Sie sich erneut an.';
      default:
        return errorCode;
    }
  }

  getMessageForValidationError(
    validationError: ApiValidationErrorMessage
  ): string {
    const constraints = validationError.constraints;
    if (constraints) {
      switch (Object.keys(constraints)[0]) {
        case 'isEmail':
          return 'Ungültige E-Mail-Adresse.';
      }
    }
    return 'Ungültige Eingabe.';
  }
}
