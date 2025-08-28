import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorManagementService } from './error-management.service';

describe('ErrorManagementService', () => {
  let service: ErrorManagementService;

  const toastControllerMock = {
    create: jest.fn().mockResolvedValue({ present: jest.fn() }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorManagementService,
        {
          provide: ToastController,
          useValue: toastControllerMock,
        },
      ],
    });
    service = TestBed.inject(ErrorManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return validation messages for 422 error', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        validationMessages: [
          { property: 'email', constraints: { isEmail: 'invalid' } },
        ],
      },
    });
    const result = service.handleValidationError(error);
    expect(result).toEqual([
      { property: 'email', constraints: { isEmail: 'invalid' } },
    ]);
  });

  it('should show toast and return null for error with code', () => {
    const showToastSpy = jest.spyOn(service, 'showToastMessage');

    const error = new HttpErrorResponse({
      status: 400,
      error: { code: 'AUTH.USER_NOT_FOUND' },
    });
    const result = service.handleValidationError(error);
    expect(showToastSpy).toHaveBeenCalledWith('Nutzer wurde nicht gefunden.');
    expect(result).toBeNull();
  });

  it('should show default toast and return null for unknown error', () => {
    const showToastSpy = jest.spyOn(service, 'showToastMessage');
    const error = new HttpErrorResponse({
      status: 500,
      error: {},
    });
    const result = service.handleValidationError(error);
    expect(showToastSpy).toHaveBeenCalledWith(
      'Unbekannter Fehler ist aufgetreten. Versuche es später erneut.'
    );
    expect(result).toBeNull();
  });

  it('should return correct message for known error code', () => {
    expect(service.getMessageForErrorCode('AUTH.EMAIL_ALREADY_EXISTS')).toBe(
      'Email exisistiert bereits.'
    );
    expect(service.getMessageForErrorCode('AUTH.USER_NOT_FOUND')).toBe(
      'Nutzer wurde nicht gefunden.'
    );
    expect(service.getMessageForErrorCode('AUTH.INVALID_CREDENTIALS')).toBe(
      'Passwort und Nutzername stimmen nicht überein.'
    );
    expect(service.getMessageForErrorCode('AUTH.INVALID_REFRESH_TOKEN')).toBe(
      'Ihre Session ist abgelaufen. Bitte melden Sie sich erneut an.'
    );
    expect(service.getMessageForErrorCode('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return correct message for validation error', () => {
    expect(
      service.getMessageForValidationError({
        property: 'email',
        constraints: { isEmail: 'invalid' },
      })
    ).toBe('Ungültige E-Mail-Adresse.');
    expect(
      service.getMessageForValidationError({
        property: 'foo',
        constraints: { other: 'invalid' },
      })
    ).toBe('Ungültige Eingabe.');
    expect(
      service.getMessageForValidationError({
        property: 'foo',
        constraints: {},
      })
    ).toBe('Ungültige Eingabe.');
  });

  it('should call ToastController.create and present toast', async () => {
    const presentMock = jest.fn();
    toastControllerMock.create.mockResolvedValue({ present: presentMock });

    await service.showToastMessage('Test');

    expect(toastControllerMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test' })
    );
    expect(presentMock).toHaveBeenCalled();
  });
});
