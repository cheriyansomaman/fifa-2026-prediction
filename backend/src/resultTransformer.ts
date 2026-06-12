import type { FdMatch } from './types';
import type { AppResult } from './types';
import { normalizeTeam } from './teamMapping';

export function toResult(match: FdMatch): AppResult {
  const { score, homeTeam, awayTeam } = match;
  const home = normalizeTeam(homeTeam.name);
  const away = normalizeTeam(awayTeam.name);

  const result: AppResult = {};

  if (score.fullTime.home !== null) result.homeGoals = score.fullTime.home;
  if (score.fullTime.away !== null) result.awayGoals = score.fullTime.away;

  const hasPenalties =
    score.penalties.home !== null && score.penalties.away !== null;

  if (hasPenalties) {
    result.homePenGoals = score.penalties.home!;
    result.awayPenGoals = score.penalties.away!;
    result.penaltyWinner =
      score.penalties.home! > score.penalties.away! ? home : away;
  }

  if (score.winner === 'HOME_TEAM') result.winner = home;
  else if (score.winner === 'AWAY_TEAM') result.winner = away;

  result.matchStatus = match.status;

  return result;
}
