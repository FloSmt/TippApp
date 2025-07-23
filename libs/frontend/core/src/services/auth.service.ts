import { Injectable } from '@angular/core';
import { AuthResponseDto } from '@tippapp/shared/data-access';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  registerNewUser(): Observable<AuthResponseDto> {
    return of();
    // TODO: Implement the logic to register a new user
  }
}
