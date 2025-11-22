import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorCardTemplateComponent } from './error-card.template.component';

describe('ErrorCardTemplateComponent', () => {
  let component: ErrorCardTemplateComponent;
  let fixture: ComponentFixture<ErrorCardTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorCardTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorCardTemplateComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'Error Title');
    fixture.componentRef.setInput('message', 'This is an error message.');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
