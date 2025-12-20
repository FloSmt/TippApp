import { Test, TestingModule } from '@nestjs/testing';
import { GroupResponse, MatchApiResponse, TipSeason } from '@tippapp/shared/data-access';
import { SeasonService } from './season.service';

describe('SeasonService', () => {
  let service: SeasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeasonService],
    }).compile();

    service = module.get<SeasonService>(SeasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a TipSeason-Object with correct content', () => {
    const mockEntityManager = {
      create: jest.fn((entity, data) => {
        return { ...data };
      }),
    } as any;

    const season = 2023;
    const leagueShortcut = 'bl1';
    const matchDays: GroupResponse[] = [
      { groupId: 11, groupName: 'Matchday 1', groupOrderId: 1 },
      { groupId: 22, groupName: 'Matchday 2', groupOrderId: 2 },
    ];
    const matches = [
      { matchId: 101, group: { groupId: 11 } },
      { matchId: 102, group: { groupId: 11 } },
      { matchId: 201, group: { groupId: 22 } },
    ] as unknown as MatchApiResponse[];

    const tipSeason = service.createTipSeason(season, leagueShortcut, matchDays, matches, mockEntityManager);

    expect(mockEntityManager.create).toHaveBeenCalledWith(TipSeason, expect.anything());
    expect(tipSeason.api_LeagueSeason).toBe(season);
    expect(tipSeason.isClosed).toBe(false);
    expect(tipSeason.matchdays.length).toBe(2);
    expect(tipSeason.matchdays[0].name).toBe('Matchday 1');
    expect(tipSeason.matchdays[0].api_groupOrderId).toBe(1);
    expect(tipSeason.matchdays[0].api_leagueShortcut).toBe(leagueShortcut);
    expect(tipSeason.matchdays[0].matches.length).toBe(2);
    expect(tipSeason.matchdays[0].matches[0].api_matchId).toBe(101);
    expect(tipSeason.matchdays[0].matches[1].api_matchId).toBe(102);
    expect(tipSeason.matchdays[1].name).toBe('Matchday 2');
    expect(tipSeason.matchdays[1].api_groupOrderId).toBe(2);
    expect(tipSeason.matchdays[1].api_leagueShortcut).toBe(leagueShortcut);
    expect(tipSeason.matchdays[1].matches.length).toBe(1);
    expect(tipSeason.matchdays[1].matches[0].api_matchId).toBe(201);
  });
});
