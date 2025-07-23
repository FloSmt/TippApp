import { inject, Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { AuthStore } from '../stores';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private axiosInstance: AxiosInstance;
  private authStore = inject(AuthStore);

  constructor(private router: Router) {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // this.setupInterceptors();
  }
}
