import {Injectable} from '@angular/core';
import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {defer, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // this.setupInterceptors();
  }

  get<T>(url: string, config?: AxiosRequestConfig): Observable<T | void> {
    return defer(() => this.axiosInstance.get<T>(url, config)).pipe(
      map(result => result.data)
    );
  }

  post<T>(url: string, data?: object, config?: AxiosRequestConfig): Observable<T> {
    return defer(() => this.axiosInstance.post<T>(url, data, config)).pipe(
      map(result => result.data)
    );
  }

  put<T>(url: string, data?: object, config?: AxiosRequestConfig): Observable<T> {
    return defer(() => this.axiosInstance.delete<T>(url, config)).pipe(
      map(result => result.data)
    );
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return defer(() => this.axiosInstance.delete<T>(url, config)).pipe(
      map(result => result.data)
    );
  }

  patch<T>(url: string, data?: object, config?: AxiosRequestConfig): Observable<T> {
    return defer(() => this.axiosInstance.patch<T>(url, data, config)).pipe(
      map(result => result.data)
    );
  }
}
