import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatchRepository } from '@tippapp/backend/shared';
import { MatchResponseMock } from '@tippapp/backend/api';
import { Match, MatchResultResponse } from '@tippapp/shared/data-access';
import { MatchService } from '../match/match.service';

describe('MatchService', () => {
  let service: MatchService;
  let matchRepositoryMock: DeepMocked<MatchRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: MatchRepository,
          useValue: createMock<MatchRepository>(),
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    matchRepositoryMock = module.get(MatchRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateMatchObject', () => {
    it('should call matchRepository.update with correct parameters', async () => {
      const mockApiResponse = MatchResponseMock[0];

      await service.updateMatchObject(mockApiResponse);

      expect(matchRepositoryMock.update).toHaveBeenCalledWith(
        { api_matchId: mockApiResponse.matchId },
        expect.objectContaining({
          api_matchId: mockApiResponse.matchId,
          kickoffDate: new Date(mockApiResponse.matchDateTime),
          lastApiUpdateDate: new Date(mockApiResponse.lastUpdateDateTime),
          scoreAway: null,
          scoreHome: null,
        } as Match)
      );
    });

    it('should call matchRepository.update with correct score', async () => {
      const mockApiResponse = {
        ...MatchResponseMock[0],
        matchResults: [new MatchResultResponse({ pointsTeam1: 2, pointsTeam2: 1 })],
      };

      await service.updateMatchObject(mockApiResponse);

      expect(matchRepositoryMock.update).toHaveBeenCalledWith(
        { api_matchId: mockApiResponse.matchId },
        expect.objectContaining({
          scoreAway: 1,
          scoreHome: 2,
        } as Match)
      );
    });
  });

  describe('updateMatchObjects', () => {
    it('should call matchRepository.updateAllByApiMatchIdIfNotUpdated with correct parameters', async () => {
      const mockApiResponses = MatchResponseMock;

      await service.updateMatchObjects(mockApiResponses);

      expect(matchRepositoryMock.updateAllByApiMatchIdIfNotUpdated).toHaveBeenCalledWith(
        mockApiResponses.map((match) =>
          expect.objectContaining({
            api_matchId: match.matchId,
            kickoffDate: new Date(match.matchDateTime),
            lastApiUpdateDate: new Date(match.lastUpdateDateTime),
            scoreAway: null,
            scoreHome: null,
          } as Match)
        )
      );
    });
  });
});
