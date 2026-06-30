import type { FdMatch } from './types';
import type { AppResult } from './types';
import { normalizeTeam } from './teamMapping';

export function toResult(match: FdMatch): AppResult {
  const { score, homeTeam, awayTeam } = match;
  const home = normalizeTeam(homeTeam.name);
  const away = normalizeTeam(awayTeam.name);

  const result: AppResult = {};

  const isPenaltyShootout = score.duration === 'PENALTY_SHOOTOUT';
  const hasPenalties =
    isPenaltyShootout &&
    score.penalties != null &&
    score.penalties.home !== null &&
    score.penalties.away !== null;

  const ftScore = isPenaltyShootout && score.regularTime != null
    ? score.regularTime
    : isPenaltyShootout && hasPenalties
    ? {
        home: (score.fullTime.home ?? 0) - score.penalties!.home!,
        away: (score.fullTime.away ?? 0) - score.penalties!.away!,
      }
    : score.fullTime;

  if (ftScore.home !== null) result.homeGoals = ftScore.home;
  if (ftScore.away !== null) result.awayGoals = ftScore.away;

  if (hasPenalties) {
    const pens = score.penalties!;
    result.homePenGoals = pens.home!;
    result.awayPenGoals = pens.away!;
    result.penaltyWinner = pens.home! > pens.away! ? home : away;
  }

  if (score.winner === 'HOME_TEAM') result.winner = home;
  else if (score.winner === 'AWAY_TEAM') result.winner = away;

  result.matchStatus = match.status;

  return result;
}
