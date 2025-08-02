import {Injectable} from '@angular/core';
import {AuthResponseDto, LoginDto, RegisterDto} from '@tippapp/shared/data-access';
import {Observable} from 'rxjs';
import {HttpClientService} from "../services";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(public httpClient: HttpClientService) {
  }

  registerNewUser(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>('auth/register', registerDto, {withCredentials: true});
  }

  loginUser(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>('auth/login', loginDto, {withCredentials: true});
  }

  refreshAccessToken(): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>('auth/refresh', {}, {withCredentials: true})
  }
}
