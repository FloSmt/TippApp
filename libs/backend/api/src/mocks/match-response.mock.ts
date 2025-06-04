import { MatchResponse } from '../../../../shared/data-access/src/apiResponses/match.response';
import { groupResponseMock } from './group-response.mock';
import { teamResponseMock } from './team-response.mock';

export const matchResponseMock = [
  {
    matchId: 1,
    matchDateTime: new Date(),
    timeZoneId: '1',
    leagueId: 1,
    leagueName: 'test',
    leagueSeason: 2024,
    leagueShortcut: 'test',
    matchDateTimeUTC: '1',
    group: groupResponseMock[0],
    team1: teamResponseMock[0],
    team2: teamResponseMock[1],
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
    group: groupResponseMock[0],
    team1: teamResponseMock[1],
    team2: teamResponseMock[0],
    matchIsFinished: false,
    matchResults: [],
  },
] as MatchResponse[];
