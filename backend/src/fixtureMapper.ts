import { GF } from '../../src/data/constants';
import { buildKO } from '../../src/data/logic';
import type { Result } from '../../src/types';
import { normalizeTeam } from './teamMapping';

export function buildFixtureIndex(results: Record<number, Result>): Map<string, number> {
  const index = new Map<string, number>();

  for (const f of GF) {
    if (!f?.home || !f?.away) continue;
    const key = `${normalizeTeam(f.home)}|${normalizeTeam(f.away)}`;
    index.set(key, f.id);
  }

  try {
    const koFixtures = buildKO(results);
    for (const f of koFixtures) {
      if (!f?.home || !f?.away || f.home === 'TBC' || f.away === 'TBC') continue;
      const home = normalizeTeam(f.home);
      const away = normalizeTeam(f.away);
      // KO home/away is our own bracket-slotting convention, not guaranteed
      // to match football-data.org's designation for that slot — index both
      // orders so resolution isn't order-sensitive for KO fixtures.
      index.set(`${home}|${away}`, f.id);
      index.set(`${away}|${home}`, f.id);
    }
  } catch (e) {
    console.warn('buildKO failed, using group fixtures only:', e instanceof Error ? e.message : e);
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
