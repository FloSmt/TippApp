import {Injectable} from '@angular/core';
import {AuthResponseDto, RegisterDto} from '@tippapp/shared/data-access';
import {Observable} from 'rxjs';
import {HttpClientService} from "./http-client.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(public httpClient: HttpClientService) {
  }

  registerNewUser(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpClient.post<AuthResponseDto>('auth/register', registerDto);
  }
}
