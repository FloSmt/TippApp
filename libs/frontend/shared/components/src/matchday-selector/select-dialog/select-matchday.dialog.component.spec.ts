import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectMatchdayDialogComponent } from './select-matchday.dialog.component';

describe('SelectMatchdayDialogComponent', () => {
  let component: SelectMatchdayDialogComponent;
  let fixture: ComponentFixture<SelectMatchdayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMatchdayDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMatchdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
