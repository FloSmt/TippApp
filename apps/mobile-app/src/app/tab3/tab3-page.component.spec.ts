import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab3PageComponent } from './tab3-page.component';

describe('Tab3Page', () => {
  let component: Tab3PageComponent;
  let fixture: ComponentFixture<Tab3PageComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Tab3PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
