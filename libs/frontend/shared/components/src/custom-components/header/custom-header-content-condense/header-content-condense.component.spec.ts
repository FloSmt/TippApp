import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderContentCondenseComponent } from './header-content-condense.component';

describe('HeaderContentCondenseComponent', () => {
  let component: HeaderContentCondenseComponent;
  let fixture: ComponentFixture<HeaderContentCondenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderContentCondenseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderContentCondenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
