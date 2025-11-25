import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ErrorManagementService, NotificationService, NotificationType } from '@tippapp/frontend/utils';
import { InterceptorService } from './interceptor.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const interceptorService = inject(InterceptorService);
  const notificationService = inject(NotificationService);
  const errorManagerService = inject(ErrorManagementService);

  return next(req).pipe(
    catchError((error) => {
      if (error.error.code) {
        // Specific Error from the Backend
        const message = errorManagerService.getMessageForErrorCode(error.error.code);
        notificationService.showTypeMessage({ message }, NotificationType.ERROR);
        console.error(`API Error (${error.status}):`, error);
      } else if (error.status === 422 && error.error && error.error.validationMessages) {
        // Backend Validation Error
        console.error('API Validation Error:', error);
      } else if (error.status === 401 && !req.url.includes('/auth/')) {
        // Token Refresh because of Unauthorized Response
        return interceptorService.handleTokenRefresh(next, req);
      } else {
        // Unknown Error
        const message = 'Ein unbekannter Fehler ist aufgetreten. Versuche es später erneut.';
        notificationService.showTypeMessage({ message }, NotificationType.ERROR);
      }

      return throwError(() => error);
    })
  );
};
