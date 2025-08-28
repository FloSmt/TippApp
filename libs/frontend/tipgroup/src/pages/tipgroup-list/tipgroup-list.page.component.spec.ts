import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipgroupListPageComponent } from './tipgroup-list.page.component';

describe('TipgroupListPageComponent', () => {
  let component: TipgroupListPageComponent;
  let fixture: ComponentFixture<TipgroupListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipgroupListPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TipgroupListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
