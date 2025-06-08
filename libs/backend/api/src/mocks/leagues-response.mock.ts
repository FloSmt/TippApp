import {LeagueResponse} from '@tippapp/shared/data-access';

export const LeaguesResponseMock = [
  {
    leagueId: 1,
    sportId: 1,
    leagueName: 'league1',
    leagueShortcut: 'l1',
    leagueSeason: 2025,
  },
  {
    leagueId: 2,
    sportId: 2,
    leagueName: 'league2',
    leagueShortcut: 'l2',
    leagueSeason: 2024,
  },
] as LeagueResponse[];
