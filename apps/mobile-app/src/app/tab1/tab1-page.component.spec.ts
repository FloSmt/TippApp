import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab1PageComponent } from './tab1-page.component';

describe('Tab1Page', () => {
  let component: Tab1PageComponent;
  let fixture: ComponentFixture<Tab1PageComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Tab1PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
