export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final';

export type Tab = 'fixtures' | 'groups' | 'knockout' | 'leaderboard' | 'results' | 'users';

export interface Fixture {
  id: number;
  matchNum?: number;
  group?: string;
  home: string;
  away: string;
  date: string;
  venue: string;
  stage: Stage;
  label?: string;
}

export interface Prediction {
  homeGoals?: number;
  awayGoals?: number;
  homePenGoals?: number;
  awayPenGoals?: number;
  winner?: string;
  penaltyWinner?: string;
}

export type Result = Prediction;

export interface TeamStanding {
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface TempPwDisplay {
  uid: string;
  pw: string;
}

export type Modal =
  | { type: 'predict'; fixture: Fixture }
  | { type: 'result'; fixture: Fixture }
  | { type: 'rules' };

export interface AppState {
  tab: Tab;
  grpTab: string;
  uid: string | null;
  isAdmin: boolean;
  users: Record<string, string>;
  preds: Record<string, Record<number, Prediction>>;
  results: Record<number, Result>;
  ko: Fixture[];
  modal: Modal | null;
  nameVal: string;
  pwVal: string;
  loading: boolean;
  allPredsLoading: boolean;
  saving: boolean;
  msg: string;
  loginError: string;
  mustChangePassword: boolean;
  newPwVal: string;
  confirmPwVal: string;
  changeError: string;
  tempPwDisplay: TempPwDisplay | null;
}
