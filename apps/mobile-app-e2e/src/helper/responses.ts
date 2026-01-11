import {
  LeagueOverviewResponseDto,
  MatchdayDetailsResponseDto,
  MatchResponseDto,
  MatchScoreDto,
  TeamDto,
} from '@tippapp/shared/data-access';

export const availableLeaguesMockResponse: LeagueOverviewResponseDto[] = [
  {
    leagueId: 1,
    leagueName: 'TestLeague 1',
    leagueShortcut: 'tl1',
    leagueSeason: 2026,
  },
  {
    leagueId: 2,
    leagueName: 'TestLeague 2',
    leagueShortcut: 'tl1',
    leagueSeason: 2026,
  },
  {
    leagueId: 3,
    leagueName: 'TestLeague 3',
    leagueShortcut: 'tl1',
    leagueSeason: 2026,
  },
];

export const matchdayDetailsMockResponse: MatchdayDetailsResponseDto[] = [
  {
    league: {
      leagueId: 0,
      leagueName: 'Test League',
      leagueShortcut: 'test',
      leagueSeason: 0,
    } satisfies LeagueOverviewResponseDto,
    matchList: [
      {
        matchId: 0,
        lastUpdatedDateTime: '2025-02-10T12:00:00',
        scheduledDateTime: '2025-02-10T12:00:00',
        isFinished: false,
        homeTeam: {
          teamId: 0,
          name: 'Test Team 1',
          shortName: 'Team1',
          logoUrl: '',
        } satisfies TeamDto,
        awayTeam: {
          teamId: 1,
          name: 'Test Team 2',
          shortName: 'Team2',
          logoUrl: '',
        } satisfies TeamDto,
        scores: {
          homeTeamScore: 0,
          awayTeamScore: 0,
        } satisfies MatchScoreDto,
      },
    ] satisfies MatchResponseDto[],
    matchdayId: 1,
    name: '1. Spieltag',
    orderId: 1,
    matchCount: 2,
  },
  {
    league: {
      leagueId: 0,
      leagueName: 'Test League',
      leagueShortcut: 'test',
      leagueSeason: 0,
    } satisfies LeagueOverviewResponseDto,
    matchList: [
      {
        matchId: 0,
        lastUpdatedDateTime: '2025-02-10T12:00:00',
        scheduledDateTime: '2025-02-10T12:00:00',
        isFinished: false,
        homeTeam: {
          teamId: 0,
          name: 'Test Team 3',
          shortName: 'Team3',
          logoUrl: '',
        } satisfies TeamDto,
        awayTeam: {
          teamId: 1,
          name: 'Test Team 4',
          shortName: 'Team4',
          logoUrl: '',
        } satisfies TeamDto,
        scores: {
          homeTeamScore: 1,
          awayTeamScore: 0,
        } satisfies MatchScoreDto,
      },
    ] satisfies MatchResponseDto[],
    matchdayId: 2,
    name: '2. Spieltag',
    orderId: 2,
    matchCount: 2,
  },
];
