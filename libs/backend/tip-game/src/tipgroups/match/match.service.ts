import { Injectable } from '@nestjs/common';
import { MatchRepository } from '@tippapp/backend/shared';
import { MatchApiResponse } from '@tippapp/shared/data-access';
import { mapApiMatchResponseToMatchEntity } from '../../helper/responses-mapper';

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository) {}

  /**
   * Updates the match object in the database based on the provided API response. It uses the matchId from the API
   * response to find the corresponding match in the database and updates its properties accordingly.
   * @param matchesFromApi The match data received from the API, which contains the updated information for the match.
   * @return A promise that resolves to the result of the update operation.
   */
  async updateMatchObject(matchesFromApi: MatchApiResponse) {
    return this.matchRepository.update(
      { api_matchId: matchesFromApi.matchId },
      mapApiMatchResponseToMatchEntity(matchesFromApi)
    );
  }

  /**
   * Updates multiple match objects in the database based on the provided array of API responses.
   * It maps each API response to a match entity and updates all matches that have a corresponding api_matchId
   * in the database and have not the newest version from the api.
   * @param matchesFromApi An array of match data received from the API.
   * @return A promise that resolves to the result of the bulk update operation.
   */
  async updateMatchObjects(matchesFromApi: MatchApiResponse[]) {
    return this.matchRepository.updateAllByApiMatchIdIfNotUpdated(
      matchesFromApi.map((match) => mapApiMatchResponseToMatchEntity(match))
    );
  }
}
