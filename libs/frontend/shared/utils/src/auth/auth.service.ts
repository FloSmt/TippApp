import {Injectable} from '@angular/core';
import {AuthResponseDto, LoginDto, RegisterDto, TipgroupResponseDto} from '@tippapp/shared/data-access';
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  readonly BACKEND_URL = 'http://localhost:3000/api/'; //TODO: add to environment-variables

  constructor(public httpClient: HttpClient, public router: Router) {
  }

  registerNewUser(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(this.BACKEND_URL + 'auth/register', registerDto, {withCredentials: true});
  }

  loginUser(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(this.BACKEND_URL + 'auth/login', loginDto, {withCredentials: true});
  }

  refreshAccessToken(): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>(this.BACKEND_URL + 'auth/refresh', {}, {withCredentials: true})
  }

  testRequest(): Observable<TipgroupResponseDto> {
    return this.httpClient.get<TipgroupResponseDto>(this.BACKEND_URL + 'user/tipgroups');
  }

  logoutAndRedirect() {
    this.router.navigate(['auth/login']);
  }
}
