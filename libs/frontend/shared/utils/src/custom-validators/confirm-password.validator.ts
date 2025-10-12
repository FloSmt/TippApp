import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function confirmPasswordValidator(
  passwordFormControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;
    const password = formGroup.get(passwordFormControlName)?.value;
    const confirmPassword = control.value;
    return password !== confirmPassword ? { passwordMismatch: true } : null;
  };
}
