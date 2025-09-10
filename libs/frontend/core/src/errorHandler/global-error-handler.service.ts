import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      console.error('GlobalErrorHandler (HTTP Error):', error.message);
    } else {
      console.error('GlobalErrorHandler (Runtime Error):', error);
    }
  }
}
