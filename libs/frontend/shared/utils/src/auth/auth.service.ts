import { inject, Injectable } from '@angular/core';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '@tippapp/shared/data-access';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ENVIRONMENT } from '../environments/environment.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly env = inject(ENVIRONMENT);

  readonly BACKEND_URL = this.env.apiUrl;

  constructor(public httpClient: HttpClient, public router: Router) {}

  registerNewUser(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(
      this.BACKEND_URL + 'auth/register',
      registerDto,
      { withCredentials: true }
    );
  }

  loginUser(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(
      this.env.apiUrl + 'auth/login',
      loginDto,
      { withCredentials: true }
    );
  }

  refreshAccessToken(): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(
      this.env.apiUrl + 'auth/refresh',
      {},
      { withCredentials: true }
    );
  }

  logoutAndRedirect() {
    this.router.navigate(['auth/login']);
  }
}
