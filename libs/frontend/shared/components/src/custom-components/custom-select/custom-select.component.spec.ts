import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { CustomSelectComponent, SelectOption } from './custom-select.component';

describe('CustomSelectComponent', () => {
  let component: CustomSelectComponent;
  let fixture: ComponentFixture<CustomSelectComponent>;
  let control: FormControl;

  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSelectComponent);
    component = fixture.componentInstance;
    control = new FormControl(null);

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', mockOptions);
    fixture.componentRef.setInput('label', 'Test Select');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle visibility of the options', () => {
    expect(component.isOpen).toBe(false);
    component.openOptions();
    expect(component.isOpen).toBe(true);
    component.openOptions();
    expect(component.isOpen).toBe(false);
  });

  it('should select an option and close the menu', () => {
    component.isOpen = true;
    const option = mockOptions[0];

    component.select(option);

    expect(control.value).toBe(option.value);
    expect(component.isOpen).toBe(false);
  });

  describe('selectedLabel Getter', () => {
    it('should return the correct label for the current value', () => {
      control.setValue(2);
      expect(component.selectedLabel).toBe('Option 2');
    });

    it('should return an empty string if no option is selected', () => {
      control.setValue(null);
      expect(component.selectedLabel).toBe('');
    });
  });

  describe('HostListener (Clickout)', () => {
    it('should set isOpen to false if click is outside the select', () => {
      component.isOpen = true;

      document.dispatchEvent(new MouseEvent('click'));

      expect(component.isOpen).toBe(false);
    });

    it('should not set isOpen to false if click was inside the select', () => {
      component.isOpen = true;

      const nativeElement = fixture.nativeElement;
      nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(component.isOpen).toBe(true);
    });
  });
});
