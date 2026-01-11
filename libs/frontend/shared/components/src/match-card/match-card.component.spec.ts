import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatchState, TimerService } from '@tippapp/frontend/utils';
import { DatePipe } from '@angular/common';
import { MatchResponseDto, TeamDto } from '@tippapp/shared/data-access';
import { MatchCardComponent } from './match-card.component';

interface TestData {
  scheduledTime: Date;
  isFinished?: boolean;
  scoreHome?: number | null;
  scoreAway?: number | null;
}

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;
  let fixture: ComponentFixture<MatchCardComponent>;

  const mockTimerService = {
    halfMinuteTick$: of(1),
  };

  const mockMatch = (testData: TestData) =>
    ({
      scheduledDateTime: testData.scheduledTime.toISOString(),
      isFinished: testData.isFinished ?? false,
      scores: {
        homeTeamScore: testData.scoreHome === undefined ? 2 : testData.scoreHome,
        awayTeamScore: testData.scoreAway === undefined ? 1 : testData.scoreAway,
      },
      matchId: 0,
      lastUpdatedDateTime: '',
      homeTeam: new TeamDto(),
      awayTeam: new TeamDto(),
    } satisfies MatchResponseDto);

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));

    await TestBed.configureTestingModule({
      imports: [MatchCardComponent],
      providers: [{ provide: TimerService, useValue: mockTimerService }, DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchCardComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should detect UPCOMING_FAR (Kickoff in > 1h)', () => {
    const farDate = new Date('2024-01-01T14:00:00Z'); // +2h
    fixture.componentRef.setInput('match', mockMatch({ scheduledTime: farDate }));

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.UPCOMING_FAR);
    expect(component.currentBatchContent()).toBe('');
  });

  it('should detect UPCOMING_SOON (Kickoff in 30 min)', () => {
    const soonDate = new Date('2024-01-01T12:30:00Z');
    fixture.componentRef.setInput('match', mockMatch({ scheduledTime: soonDate }));

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.UPCOMING_SOON);
    expect(component.currentBatchContent()).toBe('In 30 min');
  });

  it('should detect LIVE (Kickoff 10 Min ago and not finished)', () => {
    const pastDate = new Date('2024-01-01T11:50:00Z');
    fixture.componentRef.setInput('match', mockMatch({ scheduledTime: pastDate, isFinished: false }));

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.LIVE);
    expect(component.currentScoreContent()).toBe('2:1');
    expect(component.currentBatchContent()).toBe('Live');
  });

  it('should detect if match is not started', () => {
    const pastDate = new Date('2024-01-01T11:50:00Z');
    fixture.componentRef.setInput(
      'match',
      mockMatch({ scheduledTime: pastDate, isFinished: false, scoreAway: null, scoreHome: null })
    );

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.UPCOMING_SOON);
    expect(component.currentBatchContent()).toBe('In 0 min');
  });

  it('should detect Postpond match if is not started after 60 min', () => {
    const pastDate = new Date('2024-01-01T11:00:00Z');
    fixture.componentRef.setInput(
      'match',
      mockMatch({ scheduledTime: pastDate, isFinished: false, scoreAway: null, scoreHome: null })
    );

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.POSTPONED);
    expect(component.currentBatchContent()).toBe('Verschoben');
  });

  it('should detect FINISHED', () => {
    const pastDate = new Date('2024-01-01T10:00:00Z');
    fixture.componentRef.setInput('match', mockMatch({ scheduledTime: pastDate, isFinished: true }));

    fixture.detectChanges();

    expect(component.matchState()).toBe(MatchState.FINISHED);
    expect(component.currentBatchContent()).toBe('Beendet');
  });

  it('should update status, if timer get an impulse', () => {
    const soonDate = new Date('2024-01-01T12:05:00Z');
    fixture.componentRef.setInput('match', mockMatch({ scheduledTime: soonDate }));
    fixture.detectChanges();

    expect(component.currentBatchContent()).toBe('In 5 min');

    // simulate time: 2 min
    jest.advanceTimersByTime(120000);

    // manuel trigger update
    fixture.detectChanges();

    expect(component.getLiveCountdown(soonDate)).toBe(3);
  });
});
