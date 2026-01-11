import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'custom-select',
  imports: [FormsModule, IonIcon],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelectComponent {
  private readonly elementRef = inject(ElementRef);

  label = input('');
  control = input.required<FormControl>();
  options = input<SelectOption[]>([]);

  isOpen = false;

  constructor() {
    addIcons({ chevronDownOutline });
  }

  openOptions() {
    this.isOpen = !this.isOpen;
  }

  select(option: SelectOption) {
    this.control().setValue(option.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get selectedLabel(): string {
    const selected = this.options().find((opt) => opt.value === this.control().value);
    return selected ? selected.label : '';
  }
}
