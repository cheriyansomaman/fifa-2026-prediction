export type FdMatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED';

export type FdWinner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;

export interface FdScore {
  winner: FdWinner;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
  extraTime: { home: number | null; away: number | null };
  penalties: { home: number | null; away: number | null };
}

export interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
}

export interface FdMatch {
  id: number;
  utcDate: string;
  status: FdMatchStatus;
  matchday: number | null;
  stage: string;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: FdScore;
}

export interface FdMatchesResponse {
  count: number;
  matches: FdMatch[];
}

export interface AppResult {
  homeGoals?: number;
  awayGoals?: number;
  homePenGoals?: number;
  awayPenGoals?: number;
  winner?: string;
  penaltyWinner?: string;
  matchStatus?: string;
}
