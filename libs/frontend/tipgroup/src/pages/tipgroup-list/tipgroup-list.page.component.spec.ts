import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { TipgroupStore } from '@tippapp/frontend/utils';
import { BehaviorSubject } from 'rxjs';
import { TipgroupListPageComponent } from './tipgroup-list.page.component';

describe('TipgroupListPageComponent', () => {
  let component: TipgroupListPageComponent;
  let fixture: ComponentFixture<TipgroupListPageComponent>;

  let isLoadingAfterRefreshSubject: BehaviorSubject<boolean>;

  const tipgroupStoreMock = {
    loadAvailableTipgroups: jest.fn(),
    availableTipgroups: jest.fn(),
    hasError: jest.fn(),
    isLoading: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipgroupListPageComponent],
      providers: [{ provide: TipgroupStore, useValue: tipgroupStoreMock }],
    }).compileComponents();

    isLoadingAfterRefreshSubject = new BehaviorSubject(false);

    fixture = TestBed.createComponent(TipgroupListPageComponent);
    component = fixture.componentInstance;
    component.isLoadingAfterRefresh$ =
      isLoadingAfterRefreshSubject.asObservable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all tipgroups on initial loading', fakeAsync(() => {
    fixture = TestBed.createComponent(TipgroupListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tick();
    expect(tipgroupStoreMock.loadAvailableTipgroups).toHaveBeenCalled();
  }));

  it('should refresh the tipgroup-list', () => {
    const event = { target: { complete: jest.fn() } };
    component.refreshTipgroups(event);
    expect(tipgroupStoreMock.loadAvailableTipgroups).toHaveBeenCalled();
    isLoadingAfterRefreshSubject.next(true);
    isLoadingAfterRefreshSubject.next(false);

    expect(event.target.complete).toHaveBeenCalled();
  });
});
