import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@tippapp/frontend/utils';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mail } from 'ionicons/icons';

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
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly authStore = inject(AuthStore);

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
    addIcons({ mail });
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/']);
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

    return '';
  }

  navigateToRegisterPage() {
    this.router.navigate(['auth/register']);
  }
}
