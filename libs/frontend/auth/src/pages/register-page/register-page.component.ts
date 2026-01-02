import { Component, effect, inject } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mail } from 'ionicons/icons';
import { AuthStore, confirmPasswordValidator, ErrorManagementService } from '@tippapp/frontend/utils';
import { IonButton, IonContent, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiValidationErrorMessage } from '@tippapp/shared/data-access';
import { CustomInputComponent, CustromHeaderComponent } from '@tippapp/frontend/shared-components';

@Component({
  selector: 'lib-register-page',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    IonLabel,
    IonSpinner,
    IonButton,
    IonContent,
    CustomInputComponent,
    CustromHeaderComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  readonly authStore = inject(AuthStore);
  readonly errorManagagementService = inject(ErrorManagementService);
  readonly router = inject(Router);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, confirmPasswordValidator('password')]),
  });

  isLoading = this.authStore.isLoading;

  constructor() {
    addIcons({ mail });
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/']);
      }

      if (this.authStore.hasError()) {
        const errorMessages: ApiValidationErrorMessage[] | null = this.authStore.error();
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

  navigateToLoginPage() {
    this.router.navigate(['auth/login']);
  }
}
