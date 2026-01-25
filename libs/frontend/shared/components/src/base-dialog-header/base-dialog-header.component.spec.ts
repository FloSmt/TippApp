import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseDialogHeaderComponent } from './base-dialog-header.component';

describe('BaseDialogComponent', () => {
  let component: BaseDialogHeaderComponent;
  let fixture: ComponentFixture<BaseDialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseDialogHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseDialogHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
