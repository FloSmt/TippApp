import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ThemeTestPageComponent} from './theme-test-page.component';

describe('ThemeTestPageComponent', () => {
  let component: ThemeTestPageComponent;
  let fixture: ComponentFixture<ThemeTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeTestPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
