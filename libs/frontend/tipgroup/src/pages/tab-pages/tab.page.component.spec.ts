import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { provideRouter } from '@angular/router';
import { TabPageComponent } from './tab.page.component';

describe('TabPageComponent', () => {
  let component: TabPageComponent;
  let fixture: ComponentFixture<TabPageComponent>;
  let storeMock: any;

  beforeEach(async () => {
    storeMock = {
      loadInitialData: jest.fn(),
      isLoading: signal({ initial: false }),
      hasError: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [TabPageComponent],
      providers: [{ provide: TipgroupDetailsStore, useValue: storeMock }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TabPageComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadInitialData on ngOnInit with the provided tipgroupId', () => {
    const testId = 123;

    fixture.componentRef.setInput('tipgroupId', testId);

    fixture.detectChanges();

    expect(storeMock.loadInitialData).toHaveBeenCalledWith({ tipgroupId: testId });
  });
});
