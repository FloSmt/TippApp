import {TestBed} from '@angular/core/testing';

import {HttpErrorResponse} from '@angular/common/http';
import {GlobalErrorHandlerService} from './global-error-handler.service';

describe('GlobalErrorHandlerService', () => {
  let service: GlobalErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send errors to the console on Runtime Error', () => {
    jest.spyOn(console, 'error');
    const error = new Error('Test error');

    service.handleError(error);

    expect(console.error).toHaveBeenCalledWith(
      'GlobalErrorHandler (Runtime Error):',
      error
    );
  });

  it('should send errors to the console', () => {
    jest.spyOn(console, 'error');
    const error = new HttpErrorResponse({error: 'test-error', status: 500});

    service.handleError(error);

    expect(console.error).toHaveBeenCalledWith(
      'GlobalErrorHandler (HTTP Error):',
      error.message
    );
  });
});
