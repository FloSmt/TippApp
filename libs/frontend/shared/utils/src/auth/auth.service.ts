import {inject, Injectable} from '@angular/core';
import {AuthResponseDto, LoginDto, RegisterDto,} from '@tippapp/shared/data-access';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ENVIRONMENT} from '../environments/environment.token';
import {TokenStorageService} from "./token-storage.service";
import {NotificationService, NotificationType} from "../notifications/notification.service";
import {ErrorManagementService} from "../error-management/error-management.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly env = inject(ENVIRONMENT);
  private readonly tokenStorageService = inject(TokenStorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorManagementService = inject(ErrorManagementService);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  readonly BACKEND_URL = this.env.apiUrl;

  registerNewUser(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(
      this.BACKEND_URL + 'auth/register',
      registerDto,
    );
  }

  loginUser(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(
      this.env.apiUrl + 'auth/login',
      loginDto,
    );
  }

  refreshAccessToken(): Observable<AuthResponseDto> {
    return new Observable<AuthResponseDto>((observer) => {
      this.tokenStorageService.getRefreshToken().then((refreshToken: string | null) => {
        if (!refreshToken) {
          const message = this.errorManagementService.getMessageForErrorCode('AUTH.INVALID_REFRESH_TOKEN');
          this.notificationService.showTypeMessage({message}, NotificationType.ERROR);
          observer.error(new Error('No refresh token available'));
          return;
        }

        this.httpClient.post<AuthResponseDto>(
          this.env.apiUrl + 'auth/refresh',
          {refreshToken},
        ).subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
      }).catch((err) => observer.error(err));
    });
  }

  logoutAndRedirect() {
    this.router.navigate(['auth/login']);
  }
}
