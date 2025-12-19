import { MatchApiResponse, MatchResponseDto } from '@tippapp/shared/data-access';

export function mapApiMatchResponsesToMatchDayResponseDto(apiMatch: MatchApiResponse[]): MatchResponseDto[] {
  return apiMatch.map((match) => ({
    matchId: match.matchId,
    lastUpdatedDateTime: match.lastUpdatedDateTime,
    scheduledDateTime: match.matchDateTime,
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
