import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TipgroupManagementStore } from '@tippapp/frontend/utils';
import { CreateTipgroupDialogComponent } from './create-tipgroup.dialog.component';

describe('CreateTipgroupDialogComponent', () => {
  let component: CreateTipgroupDialogComponent;
  let fixture: ComponentFixture<CreateTipgroupDialogComponent>;
  let modalControllerMock: DeepMocked<ModalController>;

  const tipgroupStoreMock = {
    availableTipgroupsState: {
      data: jest.fn(),
      loadingState: jest.fn(),
    },
    availableLeaguesState: {
      isLoading: jest.fn(),
      data: jest.fn(),
    },
    createTipgroupState: {
      error: jest.fn(),
      isLoading: jest.fn(),
    },
    hasAvailableLeaguesError: jest.fn(),
    loadAvailableTipgroups: jest.fn(),
    loadAvailableLeagues: jest.fn(),
    createTipgroup: jest.fn(),
  };

  beforeEach(async () => {
    modalControllerMock = createMock<ModalController>();

    await TestBed.configureTestingModule({
      imports: [CreateTipgroupDialogComponent],
      providers: [
        { provide: TipgroupManagementStore, useValue: tipgroupStoreMock },
        {
          provide: ModalController,
          useValue: modalControllerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTipgroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
