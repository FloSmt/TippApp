import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchApiResponse, SupportedLeagueShortcuts } from '@tippapp/shared/data-access';
import { MatchResponseMock } from '@tippapp/backend/api';
import { MatchService } from '../tipgroups';
import { ApiUpdatesService } from './api-updates.service';

describe('ApiUpdatesService', () => {
  let service: ApiUpdatesService;
  let matchServiceMock: DeepMocked<MatchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiUpdatesService, { provide: MatchService, useValue: createMock<MatchService>() }],
    }).compile();

    service = module.get<ApiUpdatesService>(ApiUpdatesService);
    matchServiceMock = module.get(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleApiUpdate', () => {
    it('should call updateMatchObject if leagueShortcut is supported', async () => {
      const payload = { ...MatchResponseMock[0], matchID: 1, leagueShortcut: SupportedLeagueShortcuts[0] };

      await service.handleApiUpdate(payload);

      expect(matchServiceMock.updateMatchObject).toHaveBeenCalled();
      const arg = matchServiceMock.updateMatchObject.mock.calls[0][0];
      expect(arg).toBeInstanceOf(MatchApiResponse);
      expect(arg.matchId).toBe(payload.matchId);
    });

    it('should not call updateMatchObject if leagueShortcut is not supported', async () => {
      const payload = { ...MatchResponseMock[0], matchID: 1, leagueShortcut: 'not-supported' };

      await service.handleApiUpdate(payload);

      expect(matchServiceMock.updateMatchObject).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
