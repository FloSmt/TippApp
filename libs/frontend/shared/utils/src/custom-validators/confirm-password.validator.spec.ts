import { FormControl, FormGroup } from '@angular/forms';
import { confirmPasswordValidator } from './confirm-password.validator';

describe('confirmPasswordValidator', () => {
  it('should return null if passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('abc123'),
      confirmPassword: new FormControl('abc123'),
    });
    form
      .get('confirmPassword')
      ?.setValidators(confirmPasswordValidator('password'));
    form.get('confirmPassword')?.updateValueAndValidity();
    expect(form.get('confirmPassword')?.errors).toBeNull();
  });

  it('should return passwordMismatch error if passwords do not match', () => {
    const form = new FormGroup({
      password: new FormControl('abc123'),
      confirmPassword: new FormControl('def456'),
    });
    form
      .get('confirmPassword')
      ?.setValidators(confirmPasswordValidator('password'));
    form.get('confirmPassword')?.updateValueAndValidity();
    expect(form.get('confirmPassword')?.errors).toEqual({
      passwordMismatch: true,
    });
  });

  it('should return null if parent is not a FormGroup', () => {
    const control = new FormControl('abc123');
    const validator = confirmPasswordValidator('password');
    expect(validator(control)).toBeNull();
  });

  it('should handle missing password control gracefully', () => {
    const form = new FormGroup({
      confirmPassword: new FormControl('abc123'),
    });
    form
      .get('confirmPassword')
      ?.setValidators(confirmPasswordValidator('password'));
    form.get('confirmPassword')?.updateValueAndValidity();
    expect(form.get('confirmPassword')?.errors).toEqual({
      passwordMismatch: true,
    });
  });
});
