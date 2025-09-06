import {Component, effect, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonLabel,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular/standalone';
import {FormControl, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {AuthStore, ErrorManagementService} from '@tippapp/frontend/utils';
import {Router} from '@angular/router';
import {addIcons} from 'ionicons';
import {mail} from 'ionicons/icons';
import {ApiValidationErrorMessage} from '@tippapp/shared/data-access';

@Component({
  selector: 'lib-login-page',
  imports: [
    CommonModule,
    IonButton,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonLabel,
    IonSpinner,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly authStore = inject(AuthStore);
  readonly errorManagagementService = inject(ErrorManagementService);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  isLoading = this.authStore.isLoading;
  error = this.authStore.error;

  constructor(public router: Router) {
    addIcons({mail});
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/']);
      }

      if (this.authStore.hasError()) {
        const errorMessages: ApiValidationErrorMessage[] | null =
          this.authStore.error();
        if (errorMessages) {
          errorMessages.forEach((error) => {
            const control = this.loginForm.get(error.property);
            if (control) {
              control.setErrors({backendError: error});
            }
          });
        }
      }
    });
  }

  onLogin() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (!this.loginForm.invalid && email && password) {
      this.authStore.loginUser({
        loginDto: {
          email,
          password,
        },
      });
    }
  }

  disableLogin(): boolean {
    return this.loginForm.invalid || this.isLoading();
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return `Dieses Feld ist erforderlich.`;
    }
    if (control?.hasError('minlength')) {
      return `Passwort muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`;
    }
    if (control?.hasError('email')) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (control?.hasError('backendError')) {
      return this.errorManagagementService.getMessageForValidationError(
        control.errors?.['backendError'] as ApiValidationErrorMessage
      );
    }

    return '';
  }

  navigateToRegisterPage() {
    this.router.navigate(['auth/register']);
  }

  protected readonly JSON = JSON;
}
