import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {provideHttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthStore} from "@tippapp/frontend/utils";
import {DeepPartial} from "typeorm";
import {signal} from "@angular/core";
import {LoginPageComponent} from "./login-page.component";

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  const isAuthenticatedSignal = signal(false);
  const mockAuthStore = {
    loginUser: jest.fn(),
    isAuthenticated: isAuthenticatedSignal,
    isLoading: jest.fn()
  }

  const mockRouter = {
    navigate: jest.fn()
  }

  const defaultFormInput: FormInput = {
    email: 'test@user.de',
    password: 'testPassword',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideHttpClient(),
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: AuthStore,
          useValue: mockAuthStore
        }
      ]
    }).compileComponents();

    isAuthenticatedSignal.set(false);
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to Home if user already authenticated', fakeAsync(() => {
    isAuthenticatedSignal.set(true);

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should login the User if click on Login', () => {
    fillFormHelper();
    component.onLogin();

    expect(component.loginForm.valid).toBeTruthy();
    expect(mockAuthStore.loginUser).toHaveBeenCalledWith({
      loginDto: {
        email: defaultFormInput.email,
        password: defaultFormInput.password,
      }
    });
  });

  describe('disable login button', () => {
    beforeEach(() => {
      fillFormHelper();
    })
    it('should disable if the Form is valid but component is Loading', () => {
      jest.spyOn(component, 'isLoading').mockReturnValue(true);

      expect(component.loginForm.valid).toBeTruthy();
      expect(component.disableLogin()).toBeTruthy();
    });

    it('should disable if the Form is invalid but component is not Loading', () => {
      fillFormHelper({email: ''})
      jest.spyOn(component, 'isLoading').mockReturnValue(false);

      expect(component.loginForm.invalid).toBeTruthy();
      expect(component.disableLogin()).toBeTruthy();
    });
  })

  describe('FormGroup', () => {
    describe('Errormessages', () => {
      it('should return the required-message if the inputs are is empty', () => {
        fillFormHelper({
          email: '',
          password: '',
        })

        expect(component.getErrorMessage('email')).toBe('Dieses Feld ist erforderlich.');
        expect(component.getErrorMessage('password')).toBe('Dieses Feld ist erforderlich.');
      });

      it('should return the minlength-message if the inputs are is to short', () => {
        fillFormHelper({
          password: '12345'
        })

        expect(component.getErrorMessage('password')).toBe('Passwort muss mindestens 6 Zeichen lang sein.');
      });

      it('should return email-message if the email-input is no email', () => {
        fillFormHelper({email: 'wrongEmail'});
        expect(component.getErrorMessage('email')).toBe('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      });
    })
  })

  it('should navigate to Register-page', () => {
    component.navigateToRegisterPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/register'])
  });

  function fillFormHelper(formInput?: DeepPartial<FormInput>) {
    const fullFormInput: FormInput = {...defaultFormInput, ...formInput};
    component.loginForm.get('email')?.setValue(fullFormInput.email);
    component.loginForm.get('password')?.setValue(fullFormInput.password);

    component.loginForm.get('email')?.markAsTouched();
    fixture.detectChanges();
  }

  interface FormInput {
    email: string,
    password: string
  }
});
