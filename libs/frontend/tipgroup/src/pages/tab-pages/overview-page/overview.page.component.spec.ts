import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { TipgroupDetailsStore } from '@tippapp/frontend/utils';
import { signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { createMock } from '@golevelup/ts-jest';
import { MatchdayDetailsResponseDto, MatchResponseDto } from '@tippapp/shared/data-access';
import { OverviewPageComponent } from './overview.page.component';

describe('OverviewPageComponent', () => {
  let component: OverviewPageComponent;
  let fixture: ComponentFixture<OverviewPageComponent>;
  let storeMock: any;

  // Mock Data
  const mockMatches = [
    {
      matchId: 1,
      isFinished: true,
      scheduledDateTime: '2023-10-01T15:00:00',
      scores: { homeTeamScore: 2, awayTeamScore: 1 },
      homeTeam: {
        logoUrl: 'team1-logo.png',
        teamName: 'Team 1',
      },
      awayTeam: {
        logoUrl: 'team2-logo.png',
        teamName: 'Team 2',
      },
    },
    {
      matchId: 2,
      isFinished: false,
      scheduledDateTime: '2023-10-01T18:00:00',
      scores: { homeTeamScore: null, awayTeamScore: null },
      homeTeam: {
        logoUrl: 'team3-logo.png',
        teamName: 'Team 3',
      },
      awayTeam: {
        logoUrl: 'team4-logo.png',
        teamName: 'Team 4',
      },
    },
  ] as unknown as MatchResponseDto[];

  const matchdayMock = {
    matchdayId: 1,
    league: {
      leagueName: 'testLeague',
    },
    matchList: mockMatches,
  } as MatchdayDetailsResponseDto;

  beforeEach(async () => {
    storeMock = {
      isLoading: signal({ initial: false, matchday: false, tipgroupDetails: false }),
      getCurrentMatchday: signal(matchdayMock),
      hasError: signal(false),
      isReloadingMatchday: signal(false),
      getTipgroupDetails: signal({ id: 1, name: 'Test Group' }),
      getSelectedMatchdayId: signal(1),
      getMatchdayOverview: signal([]),
      loadMatchdayDetails: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OverviewPageComponent],
      providers: [
        DatePipe,
        { provide: TipgroupDetailsStore, useValue: storeMock },
        {
          provide: ModalController,
          useValue: createMock<ModalController>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Matchday Selection', () => {
    it('should call loadMatchdayDetails when matchday ID changes', () => {
      const newId = 5;
      component.handleMatchdayIdChange(newId);

      expect(storeMock.loadMatchdayDetails).toHaveBeenCalledWith({
        matchdayId: newId,
        reload: false,
      });
    });
  });

  describe('Grouping Logic (effect)', () => {
    it('should group matches into live, upcoming and finished when currentMatchday changes', () => {
      expect(component.groupedMatchdays).toBeDefined();
      expect(component.groupedMatchdays.finished.length).toBeGreaterThan(0);
      expect(component.groupedMatchdays.upcoming.length).toBeGreaterThan(0);
    });

    it('should format date labels correctly using DatePipe', () => {
      const finishedGroup = component.groupedMatchdays.finished[0];
      // Expected format from DatePipe 'dd.MM.yyyy'
      expect(finishedGroup.dateLabel).toBe('01.10.2023');
    });
  });

  describe('Refresh Logic', () => {
    it('should call store with reload true and complete the refresher event', (done) => {
      const eventMock = {
        target: { complete: jest.fn() },
      };

      // Trigger refresh
      component.refreshMatchday(eventMock);

      expect(storeMock.loadMatchdayDetails).toHaveBeenCalledWith({
        matchdayId: storeMock.getSelectedMatchdayId(),
        reload: true,
      });

      // Simulate the store finishing the reload: true -> false
      storeMock.isReloadingMatchday.set(true);
      fixture.detectChanges();

      storeMock.isReloadingMatchday.set(false);
      fixture.detectChanges();

      // The pipe(pairwise, filter, take(1)) should now trigger
      setTimeout(() => {
        expect(eventMock.target.complete).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('Signal Mapping', () => {
    it('should link component properties to store signals', () => {
      expect(component.hasError()).toBe(false);

      // Change store state
      storeMock.hasError.set(true);

      expect(component.hasError()).toBe(true);
    });
  });
});
