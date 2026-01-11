import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { MatchdaySelectorComponent } from './matchday-selector.component';

describe('MatchdaySelectorComponent', () => {
  let component: MatchdaySelectorComponent;
  let fixture: ComponentFixture<MatchdaySelectorComponent>;
  let modalControllerMock: any;

  const mockMatchdays = [
    { matchdayId: 1, name: 'Spieltag 1', orderId: 1 },
    { matchdayId: 2, name: 'Spieltag 2', orderId: 2 },
    { matchdayId: 3, name: 'Spieltag 3', orderId: 3 },
  ];

  beforeEach(async () => {
    modalControllerMock = {
      create: jest.fn().mockResolvedValue({
        present: jest.fn(),
        onWillDismiss: jest.fn().mockResolvedValue({ data: { selectedMatchdayId: 2 }, role: 'selected' }),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MatchdaySelectorComponent],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchdaySelectorComponent);
    component = fixture.componentInstance;
  });

  it('should sort matchday list by orderId', () => {
    fixture.componentRef.setInput('allMatchdays', [
      { matchdayId: 2, orderId: 2 },
      { matchdayId: 1, orderId: 1 },
    ]);

    fixture.detectChanges();

    expect(component.sortedMatchdays[0].matchdayId).toBe(1);
    expect(component.sortedMatchdays[1].matchdayId).toBe(2);
  });

  describe('Computed Signals (Navigation)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('allMatchdays', mockMatchdays);
      fixture.detectChanges();
    });

    it('isFirstSelected should be true if first matchday is selected', () => {
      fixture.componentRef.setInput('currentMatchdayId', 1);
      expect(component.isFirstSelected()).toBe(true);
      expect(component.isLastSelected()).toBe(false);
    });

    it('isLastSelected should be true if last matchday is selected', () => {
      fixture.componentRef.setInput('currentMatchdayId', 3);
      expect(component.isLastSelected()).toBe(true);
      expect(component.isFirstSelected()).toBe(false);
    });

    it('getMatchdayName should return the correct name', () => {
      fixture.componentRef.setInput('currentMatchdayId', 2);
      expect(component.getMatchdayName()).toBe('Spieltag 2');
    });
  });

  describe('Navigation methods', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('allMatchdays', mockMatchdays);
      fixture.componentRef.setInput('currentMatchdayId', 2);
      fixture.detectChanges();
    });

    it('selectNextEntry should set id to the next matchday', async () => {
      const setSpy = jest.spyOn(component.currentMatchdayId, 'set');
      await component.selectNextEntry();
      expect(setSpy).toHaveBeenCalledWith(3);
    });

    it('selectPreviousEntry should set id to previous matchday', async () => {
      const setSpy = jest.spyOn(component.currentMatchdayId, 'set');
      await component.selectPreviousEntry();
      expect(setSpy).toHaveBeenCalledWith(1);
    });

    it('selectNextEntry should do nothing if its the last matchday', async () => {
      fixture.componentRef.setInput('currentMatchdayId', 3);
      const setSpy = jest.spyOn(component.currentMatchdayId, 'set');
      await component.selectNextEntry();
      expect(setSpy).not.toHaveBeenCalled();
    });
  });

  describe('openSelectionDialog', () => {
    it('should not open the dialog if disableSelection is true', async () => {
      fixture.componentRef.setInput('disableSelection', true);
      await component.openSelectionDialog();
      expect(modalControllerMock.create).not.toHaveBeenCalled();
    });

    it('should update matchday id if its selected in the dialog', async () => {
      fixture.componentRef.setInput('allMatchdays', mockMatchdays);
      fixture.componentRef.setInput('currentMatchdayId', 1);

      const setSpy = jest.spyOn(component.currentMatchdayId, 'set');

      await component.openSelectionDialog();

      expect(modalControllerMock.create).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(2);
    });
  });
});
