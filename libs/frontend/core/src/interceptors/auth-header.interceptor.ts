import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthStore} from '@tippapp/frontend/utils';
import {InterceptorService} from "./interceptor.service";

export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const interceptorService = inject(InterceptorService);

  const newRequest = authStore.accessToken()
    ? interceptorService.addAuthTokenToHeader(req, authStore.accessToken()!)
    : req;

  return next(newRequest);
};
