import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchdaySelectorComponent } from './matchday-selector.component';

describe('MatchdaySelectorComponent', () => {
  let component: MatchdaySelectorComponent;
  let fixture: ComponentFixture<MatchdaySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchdaySelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchdaySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
