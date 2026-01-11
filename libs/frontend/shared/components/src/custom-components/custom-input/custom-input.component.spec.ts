import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { CustomInputComponent } from './custom-input.component';

describe('CustomInputComponent', () => {
  let component: CustomInputComponent;
  let fixture: ComponentFixture<CustomInputComponent>;

  // Mock für NgControl
  const mockNgControl = {
    valueAccessor: null,
    invalid: false,
    dirty: false,
    touched: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomInputComponent],
      providers: [{ provide: NgControl, useValue: mockNgControl }],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should update value with writeValue', () => {
      const testValue = 'test';
      component.writeValue(testValue);
      expect(component.value).toBe(testValue);
    });

    it('should register and call onChange Callback', () => {
      const spy = jest.fn();
      component.registerOnChange(spy);

      const newValue = 'new Value';
      const event = { target: { value: newValue } };
      component.onInputChange(event);

      expect(component.value).toBe(newValue);
      expect(spy).toHaveBeenCalledWith(newValue);
    });

    it('should set disabled state', () => {
      component.setDisabledState?.(true);
      expect(component.isDisabled).toBe(true);

      component.setDisabledState?.(false);
      expect(component.isDisabled).toBe(false);
    });
  });

  describe('Validation and UI logic', () => {
    it('should switch password visibility', () => {
      expect(component.passwordVisible).toBe(false);

      component.togglePasswordVisibility(true);
      expect(component.passwordVisible).toBe(true);

      component.togglePasswordVisibility(false);
      expect(component.passwordVisible).toBe(false);
    });

    it('isInvalid() should return true if the Control is invalid und dirty', () => {
      (component.ngControl as any).invalid = true;
      (component.ngControl as any).dirty = true;

      expect(component.isInvalid()).toBe(true);
    });

    it('isInvalid() should return false if the Control is untouched', () => {
      (component.ngControl as any).invalid = true;
      (component.ngControl as any).dirty = false;
      (component.ngControl as any).touched = false;

      expect(component.isInvalid()).toBe(false);
    });
  });
});
