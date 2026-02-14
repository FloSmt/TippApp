import { Match, MatchApiResponse, MatchResponseDto } from '@tippapp/shared/data-access';

export function mapApiMatchResponsesToMatchDayResponseDto(apiMatch: MatchApiResponse[]): MatchResponseDto[] {
  return apiMatch.map((match) => ({
    matchId: match.matchId,
    lastUpdateDateTime: match.lastUpdateDateTime,
    scheduledDateTime: match.matchDateTime,
    isFinished: match.matchIsFinished,
    homeTeam: {
      teamId: match.team1.teamId,
      name: match.team1.teamName,
      shortName: match.team1.shortName,
      logoUrl: match.team1.teamIconUrl,
    },
    awayTeam: {
      teamId: match.team2.teamId,
      name: match.team2.teamName,
      shortName: match.team2.shortName,
      logoUrl: match.team2.teamIconUrl,
    },
    scores: {
      homeTeamScore:
        match.matchResults.length > 0 ? match.matchResults[match.matchResults.length - 1].pointsTeam1 : null,
      awayTeamScore:
        match.matchResults.length > 0 ? match.matchResults[match.matchResults.length - 1].pointsTeam2 : null,
    },
  }));
}

export function mapApiMatchResponseToMatchEntity(matchFromApi: MatchApiResponse): Match {
  const matchEntity = new Match();

  matchEntity.api_matchId = matchFromApi.matchId;
  matchEntity.kickoffDate = new Date(matchFromApi.matchDateTime);
  matchEntity.lastApiUpdateDate = new Date(matchFromApi.lastUpdateDateTime);
  matchEntity.scoreHome =
    matchFromApi.matchResults.length > 0
      ? matchFromApi.matchResults[matchFromApi.matchResults.length - 1].pointsTeam1
      : null;
  matchEntity.scoreAway =
    matchFromApi.matchResults.length > 0
      ? matchFromApi.matchResults[matchFromApi.matchResults.length - 1].pointsTeam2
      : null;

  return matchEntity;
}
