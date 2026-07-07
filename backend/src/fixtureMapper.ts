import { GF } from '../../src/data/constants';
import { buildKO } from '../../src/data/logic';
import type { Fixture, Result } from '../../src/types';
import { normalizeTeam } from './teamMapping';

export interface FixtureMatch {
  id: number;
  /** true when the API's home team is our fixture's away team — scores must be flipped */
  swapped: boolean;
}

export function buildFixtureIndex(results: Record<number, Result>): Map<string, FixtureMatch> {
  const index = new Map<string, FixtureMatch>();

  const fixtures: Fixture[] = [...GF];
  try {
    fixtures.push(...buildKO(results));
  } catch (e) {
    console.warn('buildKO failed, using group fixtures only:', e instanceof Error ? e.message : e);
  }

  const usable = fixtures.filter(
    (f) => f?.home && f?.away && f.home !== 'TBC' && f.away !== 'TBC',
  );

  // Forward entries first — an exact home/away designation match always wins.
  // KO fixtures come after groups so a KO rematch of a group pairing takes
  // precedence, matching the live-sync window (group games are long finished).
  for (const f of usable) {
    index.set(`${normalizeTeam(f.home)}|${normalizeTeam(f.away)}`, { id: f.id, swapped: false });
  }

  // Reversed fallback entries — the API's home/away designation doesn't always
  // match ours (KO home/away is our own bracket-slotting convention). Never
  // clobber a forward entry: exact orientation stays authoritative.
  for (const f of usable) {
    const revKey = `${normalizeTeam(f.away)}|${normalizeTeam(f.home)}`;
    if (!index.has(revKey)) index.set(revKey, { id: f.id, swapped: true });
  }

  return index;
}

export function resolveFixtureId(
  homeTeam: string,
  awayTeam: string,
  index: Map<string, FixtureMatch>,
): FixtureMatch | null {
  const key = `${normalizeTeam(homeTeam)}|${normalizeTeam(awayTeam)}`;
  return index.get(key) ?? null;
}
