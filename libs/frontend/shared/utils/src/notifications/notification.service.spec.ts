import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';

import { NotificationService, NotificationType } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastController: ToastController;
  let createSpy: jest.SpyInstance;
  let presentSpy: jest.Mock;

  beforeEach(() => {
    presentSpy = jest.fn();
    createSpy = jest.fn().mockResolvedValue({ present: presentSpy });
    toastController = { create: createSpy } as any;
    TestBed.configureTestingModule({
      providers: [{ provide: ToastController, useValue: toastController }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show error toast', async () => {
    await service.showTypeMessage(
      { message: 'Fehler' },
      NotificationType.ERROR
    );
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Fehler',
        duration: 6000,
        cssClass: expect.stringContaining('toast-error'),
        icon: expect.any(String),
      })
    );
    expect(presentSpy).toHaveBeenCalled();
  });

  it('should show info toast', async () => {
    await service.showTypeMessage({ message: 'Info' }, NotificationType.INFO);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Info',
        duration: 6000,
        cssClass: expect.stringContaining('toast-info'),
        icon: expect.any(String),
      })
    );
    expect(presentSpy).toHaveBeenCalled();
  });

  it('should show success toast', async () => {
    await service.showTypeMessage(
      { message: 'Erfolg' },
      NotificationType.SUCCESS
    );
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Erfolg',
        duration: 3000,
        cssClass: expect.stringContaining('toast-success'),
        icon: expect.any(String),
      })
    );
    expect(presentSpy).toHaveBeenCalled();
  });
});
