import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTipgroupDialogComponent } from './create-tipgroup.dialog.component';

describe('CreateTipgroupDialogComponent', () => {
  let component: CreateTipgroupDialogComponent;
  let fixture: ComponentFixture<CreateTipgroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTipgroupDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTipgroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
