import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab2PageComponent } from './tab2-page.component';

describe('Tab2Page', () => {
  let component: Tab2PageComponent;
  let fixture: ComponentFixture<Tab2PageComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Tab2PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
