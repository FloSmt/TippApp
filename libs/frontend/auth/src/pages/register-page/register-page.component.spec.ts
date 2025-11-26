import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import {
  AuthStore,
  confirmPasswordValidator,
  ErrorManagementService,
} from '@tippapp/frontend/utils';
import { DeepPartial } from 'typeorm';
import { signal } from '@angular/core';
import { ApiValidationErrorMessage } from '@tippapp/shared/data-access';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;

  const isAuthenticatedSignal = signal(false);
  const mockAuthStore = {
    registerNewUser: jest.fn(),
    isAuthenticated: isAuthenticatedSignal,
    isLoading: jest.fn(),
    error: signal<ApiValidationErrorMessage[] | null>(null),
    hasError: signal<boolean>(false),
  };

  const mockErrorManagementService = {
    getMessageForValidationError: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const defaultFormInput: FormInput = {
    username: 'testUser',
    email: 'test@user.de',
    password: 'testPassword',
    confirmPassword: 'testPassword',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideHttpClient(),
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: AuthStore,
          useValue: mockAuthStore,
        },
        {
          provide: ErrorManagementService,
          useValue: mockErrorManagementService,
        },
      ],
    }).compileComponents();

    isAuthenticatedSignal.set(false);
    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to Home if user already authenticated', fakeAsync(() => {
    isAuthenticatedSignal.set(true);

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should create a User if click on Registration', () => {
    fillFormHelper();
    component.onRegister();

    expect(component.registerForm.valid).toBeTruthy();
    expect(mockAuthStore.registerNewUser).toHaveBeenCalledWith({
      registerDto: {
        username: defaultFormInput.username,
        email: defaultFormInput.email,
        password: defaultFormInput.password,
      },
    });
  });

  describe('disable registration button', () => {
    beforeEach(() => {
      fillFormHelper();
    });
    it('should disable if the Form is valid but component is Loading', () => {
      jest.spyOn(component, 'isLoading').mockReturnValue(true);

      expect(component.registerForm.valid).toBeTruthy();
      expect(component.disableRegistration()).toBeTruthy();
    });

    it('should disable if the Form is invalid but component is not Loading', () => {
      fillFormHelper({ email: '' });
      jest.spyOn(component, 'isLoading').mockReturnValue(false);

      expect(component.registerForm.invalid).toBeTruthy();
      expect(component.disableRegistration()).toBeTruthy();
    });
  });

  describe('FormGroup', () => {
    describe('Errormessages', () => {
      it('should set a Validation-error from the backend', fakeAsync(() => {
        fixture = TestBed.createComponent(RegisterPageComponent);
        component = fixture.componentInstance;

        fillFormHelper({ email: 'test@email.de', password: 'test123' });

        const backendError: ApiValidationErrorMessage = {
          property: 'email',
          constraints: { isEmail: 'Test-Message' },
        };

        mockErrorManagementService.getMessageForValidationError.mockReturnValue(
          'Test-Message'
        );

        mockAuthStore.hasError.set(true);
        mockAuthStore.error.set([backendError]);
        fixture.detectChanges();

        const emailControl = component.registerForm.get('email');
        expect(emailControl?.hasError('backendError')).toBeTruthy();
        expect(emailControl?.errors?.['backendError']).toEqual(backendError);
        expect(
          mockErrorManagementService.getMessageForValidationError
        ).toHaveBeenCalledWith(backendError);
        expect(component.getErrorMessage('email')).toBe('Test-Message');
      }));
      it('should return the required-message if the inputs are is empty', () => {
        fillFormHelper({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        expect(component.getErrorMessage('username')).toBe(
          'Dieses Feld ist erforderlich.'
        );
        expect(component.getErrorMessage('email')).toBe(
          'Dieses Feld ist erforderlich.'
        );
        expect(component.getErrorMessage('password')).toBe(
          'Dieses Feld ist erforderlich.'
        );
        expect(component.getErrorMessage('confirmPassword')).toBe(
          'Dieses Feld ist erforderlich.'
        );
      });

      it('should return the minlength-message if the inputs are is to short', () => {
        fillFormHelper({
          username: '12',
          password: '12345',
        });

        expect(component.getErrorMessage('username')).toBe(
          'Nutzername muss mindestens 3 Zeichen lang sein.'
        );
        expect(component.getErrorMessage('password')).toBe(
          'Passwort muss mindestens 6 Zeichen lang sein.'
        );
      });

      it('should return email-message if the email-input is no email', () => {
        fillFormHelper({ email: 'wrongEmail' });
        expect(component.getErrorMessage('email')).toBe(
          'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
        );
      });
    });

    describe('confirmPasswordValidator', () => {
      let formGroup: FormGroup;

      const setupFormGroup = (
        passwordValue: string,
        confirmPasswordValue: string
      ) => {
        formGroup = new FormGroup({
          password: new FormControl(passwordValue),
          confirmPassword: new FormControl(
            confirmPasswordValue,
            confirmPasswordValidator('password')
          ),
        });
      };

      it('should return null if passwords are identical', () => {
        const password = 'testpassword123';
        setupFormGroup(password, password);

        const confirmPasswordControl = formGroup.get('confirmPassword');
        confirmPasswordControl?.updateValueAndValidity();

        expect(confirmPasswordControl?.errors).toBeNull();
      });

      it('should return passwordMismatch if passwords are not identical', () => {
        const password = 'testpassword123';
        const confirmPassword = 'wrongpassword';
        setupFormGroup(password, confirmPassword);

        const confirmPasswordControl = formGroup.get('confirmPassword');
        confirmPasswordControl?.updateValueAndValidity();

        expect(confirmPasswordControl?.errors).toEqual({
          passwordMismatch: true,
        });
      });
    });
  });

  it('should navigate to Login-page', () => {
    component.navigateToLoginPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
  });

  function fillFormHelper(formInput?: DeepPartial<FormInput>) {
    const fullFormInput: FormInput = { ...defaultFormInput, ...formInput };
    component.registerForm.get('username')?.setValue(fullFormInput.username);
    component.registerForm.get('email')?.setValue(fullFormInput.email);
    component.registerForm.get('password')?.setValue(fullFormInput.password);
    component.registerForm
      .get('confirmPassword')
      ?.setValue(fullFormInput.confirmPassword);

    component.registerForm.get('username')?.markAsTouched();
    fixture.detectChanges();
  }

  interface FormInput {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
});
