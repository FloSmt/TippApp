import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustromHeaderComponent } from './custrom-header.component';

describe('CustromHeaderComponent', () => {
  let component: CustromHeaderComponent;
  let fixture: ComponentFixture<CustromHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustromHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustromHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
