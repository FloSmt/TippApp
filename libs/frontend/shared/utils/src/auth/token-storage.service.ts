import {inject, Injectable} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Preferences} from "@capacitor/preferences";

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly platform = inject(Platform);

  async setRefreshToken(token: string): Promise<void> {
    if (this.platform.is('hybrid')) {
      await Preferences.set({key: 'refreshToken', value: token});
    } else {
      localStorage.setItem('refreshToken', token);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.platform.is('hybrid')) {
      const {value} = await Preferences.get({key: 'refreshToken'});
      return value;
    } else {
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
