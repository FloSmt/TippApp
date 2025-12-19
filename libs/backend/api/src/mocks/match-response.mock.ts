import { MatchApiResponse } from '@tippapp/shared/data-access';
import { GroupResponseMock } from './group-response.mock';
import { TeamResponseMock } from './team-response.mock';

export const MatchResponseMock = [
  {
    matchId: 1,
    matchDateTime: new Date(),
    timeZoneId: '1',
    leagueId: 1,
    leagueName: 'test',
    leagueSeason: 2024,
    leagueShortcut: 'test',
    matchDateTimeUTC: '1',
    lastUpdatedDateTime: '2025-11-28T19:30:00Z',
    group: GroupResponseMock[0],
    team1: TeamResponseMock[0],
    team2: TeamResponseMock[1],
    matchIsFinished: false,
    matchResults: [],
  },
  {
    matchId: 2,
    matchDateTime: new Date(),
    timeZoneId: '2',
    leagueId: 2,
    leagueName: 'test',
    leagueSeason: 2024,
    leagueShortcut: 'test',
    matchDateTimeUTC: '2',
    lastUpdatedDateTime: '2025-11-28T19:30:00Z',
    group: GroupResponseMock[0],
    team1: TeamResponseMock[1],
    team2: TeamResponseMock[0],
    matchIsFinished: false,
    matchResults: [],
  },
] as MatchApiResponse[];
