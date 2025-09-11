import {Injectable} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Preferences} from "@capacitor/preferences";

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor(private platform: Platform) {
  }

  async setRefreshToken(token: string): Promise<void> {
    if (this.platform.is('hybrid')) {
      await Preferences.set({key: 'refreshToken', value: token});
    } else {
      localStorage.setItem('refreshToken', token);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.platform.is('hybrid')) {
      console.log('Getting refresh token from Preferences');
      const {value} = await Preferences.get({key: 'refreshToken'});
      return value;
    } else {
      console.log('Getting refresh token from localStorage');
      return localStorage.getItem('refreshToken');
    }
  }

  async clearTokens(): Promise<void> {
    if (this.platform.is('hybrid')) {
      await Preferences.remove({key: 'refreshToken'});
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

}
