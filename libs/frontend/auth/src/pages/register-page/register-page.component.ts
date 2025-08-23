import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { addIcons } from 'ionicons';
import { mail } from 'ionicons/icons';
import { AuthStore, ErrorManagementService } from '@tippapp/frontend/utils';
import {
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiValidationErrorMessage } from '@tippapp/shared/data-access';

@Component({
  selector: 'lib-register-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonLabel,
    IonSpinner,
    IonButton,
    IonInputPasswordToggle,
    IonInput,
    IonContent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  readonly authStore = inject(AuthStore);
  readonly errorManagagementService = inject(ErrorManagementService);
  readonly router = inject(Router);

  registerForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      this.confirmPasswordValidator(),
    ]),
  });

  isLoading = this.authStore.isLoading;

  constructor() {
    addIcons({ mail });
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/']);
      }

      if (this.authStore.hasError()) {
        const errorMessages: ApiValidationErrorMessage[] | null =
          this.authStore.error();
        if (errorMessages) {
          errorMessages.forEach((error) => {
            const control = this.registerForm.get(error.property);
            if (control) {
              control.setErrors({ backendError: error });
            }
          });
        }
      }
    });
  }

  onRegister() {
    const username = this.registerForm.get('username')?.value;
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    if (!this.registerForm.invalid && username && email && password) {
      this.authStore.registerNewUser({
        registerDto: {
          username,
          email,
          password,
        },
      });
    }
  }

  disableRegistration(): boolean {
    return this.registerForm.invalid || this.isLoading();
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return `Dieses Feld ist erforderlich.`;
    }
    if (control?.hasError('minlength')) {
      return controlName === 'username'
        ? `Nutzername muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`
        : `Passwort muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`;
    }
    if (control?.hasError('email')) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (control?.hasError('passwordMismatch')) {
      return 'Die Passwörter stimmen nicht überein.';
    }

    if (control?.hasError('backendError')) {
      return this.errorManagagementService.getMessageForValidationError(
        control.errors?.['backendError'] as ApiValidationErrorMessage
      );
    }

    return '';
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent as FormGroup;
      if (!formGroup) return null;
      const password = formGroup.get('password')?.value;
      const confirmPassword = control.value;
      return password !== confirmPassword ? { passwordMismatch: true } : null;
    };
  }

  navigateToLoginPage() {
    this.router.navigate(['auth/login']);
  }
}
