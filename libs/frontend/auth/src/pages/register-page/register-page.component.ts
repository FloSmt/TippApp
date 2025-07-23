import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
import { AuthStore } from '@tippapp/frontend/core';

@Component({
  selector: 'lib-register-page',
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  readonly authStore = inject(AuthStore);

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
      console.log('AuthStore state changed:', this.isLoading());
    });
  }

  onRegister() {
    // Handle registration logic here
    console.log('Registration form submitted');
    this.authStore.registerNewUser();
  }

  disableRegistration(): boolean {
    return this.registerForm.invalid;
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return `Dieses Feld ist erforderlich.`;
    }
    if (control?.hasError('minlength')) {
      return `Nutzername muss mindestens ${control.errors?.['minlength'].requiredLength} Zeichen lang sein.`;
    }
    if (control?.hasError('email')) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (control?.hasError('passwordMismatch')) {
      return 'Die Passwörter stimmen nicht überein.';
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
}
