import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TipgroupManagementStore } from '@tippapp/frontend/utils';
import { BehaviorSubject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ModalController } from '@ionic/angular/standalone';
import { TipgroupListPageComponent } from './tipgroup-list.page.component';

describe('TipgroupListPageComponent', () => {
  let component: TipgroupListPageComponent;
  let fixture: ComponentFixture<TipgroupListPageComponent>;
  let modalControllerMock: DeepMocked<ModalController>;

  let isLoadingAfterRefreshSubject: BehaviorSubject<boolean>;

  const tipgroupStoreMock = {
    availableTipgroupsState: {
      data: jest.fn(),
      loadingState: jest.fn(),
    },
    isLoadingTipgroups: jest.fn(),
    hasErrorOnLoadingTipgroups: jest.fn(),
    loadAvailableTipgroups: jest.fn(),
  };

  beforeEach(async () => {
    modalControllerMock = createMock<ModalController>();

    await TestBed.configureTestingModule({
      imports: [TipgroupListPageComponent],
      providers: [
        { provide: TipgroupManagementStore, useValue: tipgroupStoreMock },
        {
          provide: ModalController,
          useValue: modalControllerMock,
        },
      ],
    }).compileComponents();

    isLoadingAfterRefreshSubject = new BehaviorSubject(false);

    fixture = TestBed.createComponent(TipgroupListPageComponent);
    component = fixture.componentInstance;
    component.isLoadingAfterRefresh$ = isLoadingAfterRefreshSubject.asObservable();
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

  it('should refresh the matchday-list', () => {
    const event = { target: { complete: jest.fn() } };
    component.refreshTipgroups(event);
    expect(tipgroupStoreMock.loadAvailableTipgroups).toHaveBeenCalled();
    isLoadingAfterRefreshSubject.next(true);
    isLoadingAfterRefreshSubject.next(false);

    expect(event.target.complete).toHaveBeenCalled();
  });
});
