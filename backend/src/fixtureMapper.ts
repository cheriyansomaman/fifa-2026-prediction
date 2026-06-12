import { GF } from '../../src/data/constants';
import { buildKO } from '../../src/data/logic';
import type { Result } from '../../src/types';
import { normalizeTeam } from './teamMapping';

export function buildFixtureIndex(results: Record<number, Result>): Map<string, number> {
  const index = new Map<string, number>();

  for (const f of GF) {
    const key = `${normalizeTeam(f.home)}|${normalizeTeam(f.away)}`;
    index.set(key, f.id);
  }

  const koFixtures = buildKO(results);
  for (const f of koFixtures) {
    if (f.home !== 'TBC' && f.away !== 'TBC') {
      const key = `${normalizeTeam(f.home)}|${normalizeTeam(f.away)}`;
      index.set(key, f.id);
    }
  }

  return index;
}

export function resolveFixtureId(
  homeTeam: string,
  awayTeam: string,
  index: Map<string, number>,
): number | null {
  const key = `${normalizeTeam(homeTeam)}|${normalizeTeam(awayTeam)}`;
  return index.get(key) ?? null;
}
