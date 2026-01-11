import { ChangeDetectionStrategy, Component, inject, input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle, eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'custom-input',
  imports: [IonIcon],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInputComponent implements ControlValueAccessor {
  @Self() @Optional() public ngControl = inject(NgControl);

  label = input<string>('');
  placeholder = input<string>('');
  errorMessage = input<string | null>(null);
  maxLength = input<number>();
  type = input<string>('');
  autocomplete = input<string>();

  enablePasswordToggle = input<boolean>(false);

  value: any = '';
  isDisabled = false;

  passwordVisible = false;

  constructor() {
    addIcons({ eye, eyeOff, closeCircle });
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  isInvalid() {
    return this.ngControl.invalid && (this.ngControl.dirty || this.ngControl.touched);
  }

  togglePasswordVisibility(visible: boolean) {
    this.passwordVisible = visible;
  }

  onChange: any = () => {
    /* empty */
  };
  onTouched: any = () => {
    /* empty */
  };

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: any) {
    const newValue = event.target.value;
    this.value = newValue;
    this.onChange(newValue);
  }
}
