import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ThemeTestPageComponent} from './theme-test-page.component';
import {provideHttpClient} from "@angular/common/http";

describe('ThemeTestPageComponent', () => {
  let component: ThemeTestPageComponent;
  let fixture: ComponentFixture<ThemeTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeTestPageComponent],
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
