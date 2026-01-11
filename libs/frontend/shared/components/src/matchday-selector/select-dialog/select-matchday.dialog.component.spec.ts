import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { MatchdayOverviewResponseDto } from '@tippapp/shared/data-access';
import { SelectMatchdayDialogComponent } from './select-matchday.dialog.component';

describe('SelectMatchdayDialogComponent', () => {
  let component: SelectMatchdayDialogComponent;
  let fixture: ComponentFixture<SelectMatchdayDialogComponent>;
  let modalControllerMock: any;

  const mockMatchdays = [
    { matchdayId: 10, name: 'Spieltag 10', orderId: 10, matchCount: 1 },
    { matchdayId: 11, name: 'Spieltag 11', orderId: 11, matchCount: 2 },
  ] satisfies MatchdayOverviewResponseDto[];

  beforeEach(async () => {
    modalControllerMock = {
      dismiss: jest.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [SelectMatchdayDialogComponent],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMatchdayDialogComponent);
    component = fixture.componentInstance;

    component.allMatchdays = mockMatchdays;
    component.currentSelectedId = 10;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleSelection', () => {
    it('should send the correct data', async () => {
      const selectedId = 11;

      await component.handleSelection(selectedId);

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith({ selectedMatchdayId: selectedId }, 'selected');
    });
  });
});
