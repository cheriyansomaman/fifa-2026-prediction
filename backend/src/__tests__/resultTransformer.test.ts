import { describe, it, expect } from 'vitest';
import { toResult } from '../resultTransformer';
import type { FdMatch } from '../types';

function makeFdMatch(overrides: Partial<FdMatch> = {}): FdMatch {
  return {
    id: 1,
    utcDate: '2026-06-11T19:00:00Z',
    status: 'FINISHED',
    matchday: 1,
    stage: 'GROUP_STAGE',
    homeTeam: { id: 1, name: 'Brazil', shortName: 'Brazil', tla: 'BRA' },
    awayTeam: { id: 2, name: 'Morocco', shortName: 'Morocco', tla: 'MAR' },
    score: {
      winner: 'HOME_TEAM',
      duration: 'REGULAR',
      fullTime: { home: 2, away: 1 },
      halfTime: { home: 1, away: 0 },
      extraTime: null,
      penalties: null,
    },
    ...overrides,
  };
}

describe('toResult', () => {
  it('converts a regular decisive match', () => {
    const match = makeFdMatch();
    const result = toResult(match);

    expect(result.homeGoals).toBe(2);
    expect(result.awayGoals).toBe(1);
    expect(result.winner).toBe('Brazil');
    expect(result.matchStatus).toBe('FINISHED');
    expect(result.homePenGoals).toBeUndefined();
    expect(result.awayPenGoals).toBeUndefined();
    expect(result.penaltyWinner).toBeUndefined();
  });

  it('converts an away-team win', () => {
    const match = makeFdMatch({
      score: {
        winner: 'AWAY_TEAM',
        duration: 'REGULAR',
        fullTime: { home: 0, away: 3 },
        halfTime: { home: 0, away: 1 },
        extraTime: null,
        penalties: null,
      },
    });
    const result = toResult(match);

    expect(result.homeGoals).toBe(0);
    expect(result.awayGoals).toBe(3);
    expect(result.winner).toBe('Morocco');
  });

  it('converts a draw (no penalties)', () => {
    const match = makeFdMatch({
      score: {
        winner: 'DRAW',
        duration: 'REGULAR',
        fullTime: { home: 1, away: 1 },
        halfTime: { home: 0, away: 1 },
        extraTime: null,
        penalties: null,
      },
    });
    const result = toResult(match);

    expect(result.homeGoals).toBe(1);
    expect(result.awayGoals).toBe(1);
    expect(result.winner).toBeUndefined();
    expect(result.penaltyWinner).toBeUndefined();
  });

  it('converts a penalty shootout result', () => {
    const match = makeFdMatch({
      score: {
        winner: 'HOME_TEAM',
        duration: 'PENALTY_SHOOTOUT',
        fullTime: { home: 1, away: 1 },
        halfTime: { home: 0, away: 0 },
        extraTime: { home: 0, away: 0 },
        penalties: { home: 4, away: 2 },
      },
    });
    const result = toResult(match);

    expect(result.homeGoals).toBe(1);
    expect(result.awayGoals).toBe(1);
    expect(result.homePenGoals).toBe(4);
    expect(result.awayPenGoals).toBe(2);
    expect(result.penaltyWinner).toBe('Brazil');
    expect(result.winner).toBe('Brazil');
  });

  it('converts a penalty shootout where away team wins', () => {
    const match = makeFdMatch({
      score: {
        winner: 'AWAY_TEAM',
        duration: 'PENALTY_SHOOTOUT',
        fullTime: { home: 2, away: 2 },
        halfTime: { home: 1, away: 1 },
        extraTime: { home: 1, away: 1 },
        penalties: { home: 3, away: 5 },
      },
    });
    const result = toResult(match);

    expect(result.homePenGoals).toBe(3);
    expect(result.awayPenGoals).toBe(5);
    expect(result.penaltyWinner).toBe('Morocco');
    expect(result.winner).toBe('Morocco');
  });

  it('normalizes team names from API aliases', () => {
    const match = makeFdMatch({
      homeTeam: { id: 10, name: 'Korea Republic', shortName: 'Korea Republic', tla: 'KOR' },
      awayTeam: { id: 11, name: 'Turkey', shortName: 'Turkey', tla: 'TUR' },
      score: {
        winner: 'HOME_TEAM',
        duration: 'REGULAR',
        fullTime: { home: 1, away: 0 },
        halfTime: { home: 1, away: 0 },
        extraTime: null,
        penalties: null,
      },
    });
    const result = toResult(match);

    expect(result.winner).toBe('South Korea');
  });

  it('does not set homeGoals/awayGoals when fullTime scores are null', () => {
    const match = makeFdMatch({
      status: 'SCHEDULED',
      score: {
        winner: null,
        duration: 'REGULAR',
        fullTime: { home: null, away: null },
        halfTime: { home: null, away: null },
        extraTime: null,
        penalties: null,
      },
    });
    const result = toResult(match);

    expect(result.homeGoals).toBeUndefined();
    expect(result.awayGoals).toBeUndefined();
    expect(result.winner).toBeUndefined();
    expect(result.matchStatus).toBe('SCHEDULED');
  });

  it('sets matchStatus correctly for in-play matches', () => {
    const match = makeFdMatch({
      status: 'IN_PLAY',
      score: {
        winner: null,
        duration: 'REGULAR',
        fullTime: { home: 1, away: 0 },
        halfTime: { home: 0, away: 0 },
        extraTime: null,
        penalties: null,
      },
    });
    const result = toResult(match);

    expect(result.matchStatus).toBe('IN_PLAY');
    expect(result.homeGoals).toBe(1);
    expect(result.awayGoals).toBe(0);
  });

  it('does not set penalty fields when penalties object has null values', () => {
    const match = makeFdMatch({
      score: {
        winner: null,
        duration: 'REGULAR',
        fullTime: { home: 0, away: 0 },
        halfTime: { home: 0, away: 0 },
        extraTime: null,
        penalties: { home: null, away: null },
      },
    });
    const result = toResult(match);

    expect(result.homePenGoals).toBeUndefined();
    expect(result.awayPenGoals).toBeUndefined();
    expect(result.penaltyWinner).toBeUndefined();
  });
});
