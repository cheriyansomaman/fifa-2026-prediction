import { describe, it, expect } from 'vitest';
import { buildFixtureIndex, resolveFixtureId } from '../fixtureMapper';

describe('buildFixtureIndex', () => {
  it('builds an index containing all 72 group fixtures (both orientations)', () => {
    const index = buildFixtureIndex({});
    // 72 group fixtures indexed forward + reversed; KO fixtures with TBC teams skipped
    expect(index.size).toBeGreaterThanOrEqual(144);
  });

  it('maps normalized team names as keys', () => {
    const index = buildFixtureIndex({});
    // Mexico vs South Africa is fixture 1
    expect(index.get('Mexico|South Africa')).toEqual({ id: 1, swapped: false });
    // Brazil vs Morocco is fixture 7 (group C, second group, first match)
    expect(index.get('Brazil|Morocco')).toBeDefined();
  });

  it('does not include KO fixtures with TBC teams', () => {
    const index = buildFixtureIndex({});
    const hasTBC = [...index.keys()].some((k) => k.includes('TBC'));
    expect(hasTBC).toBe(false);
  });
});

describe('resolveFixtureId', () => {
  it('resolves a known group fixture by team names', () => {
    const index = buildFixtureIndex({});
    expect(resolveFixtureId('Mexico', 'South Africa', index)).toEqual({ id: 1, swapped: false });
  });

  it('resolves with API team name aliases (normalized)', () => {
    const index = buildFixtureIndex({});
    // "Korea Republic" normalizes to "South Korea"
    // South Korea vs Czechia is fixture id=2
    expect(resolveFixtureId('Korea Republic', 'Czech Republic', index)).toEqual({ id: 2, swapped: false });
  });

  it('returns null for unknown fixture', () => {
    const index = buildFixtureIndex({});
    const resolved = resolveFixtureId('Atlantis', 'Mordor', index);
    expect(resolved).toBeNull();
  });

  it('resolves a group fixture with reversed home/away designation and flags the swap', () => {
    const index = buildFixtureIndex({});
    const forward = resolveFixtureId('Mexico', 'South Africa', index);
    const reverse = resolveFixtureId('South Africa', 'Mexico', index);
    expect(forward).toEqual({ id: 1, swapped: false });
    expect(reverse).toEqual({ id: 1, swapped: true });
  });

  it('resolves KO fixtures regardless of home/away order (bracket slotting is our own convention, not the API\'s)', () => {
    const index = buildFixtureIndex({
      101: { homeGoals: 2, awayGoals: 0 }, // Canada beats South Africa
      104: { homeGoals: 1, awayGoals: 2 }, // Morocco beats Netherlands
    });
    // R16 fixture 201 = winner(101) vs winner(104) = Canada vs Morocco
    expect(resolveFixtureId('Canada', 'Morocco', index)).toEqual({ id: 201, swapped: false });
    expect(resolveFixtureId('Morocco', 'Canada', index)).toEqual({ id: 201, swapped: true });
  });

  it('prefers exact orientation over a reversed fallback of another fixture', () => {
    const index = buildFixtureIndex({});
    // Group A fixture 6 is South Africa vs South Korea; its forward entry must
    // not be shadowed by a reversed entry of any other fixture.
    const resolved = resolveFixtureId('South Africa', 'Korea Republic', index);
    expect(resolved).toEqual({ id: 6, swapped: false });
  });

  it('resolves various group fixtures correctly', () => {
    const index = buildFixtureIndex({});

    // Group B: Canada vs Bosnia & Herzegovina (fixture 7)
    expect(resolveFixtureId('Canada', 'Bosnia & Herzegovina', index)?.id).toBe(7);
    // Using API alias
    expect(resolveFixtureId('Canada', 'Bosnia and Herzegovina', index)?.id).toBe(7);

    // Group D: United States vs Paraguay (fixture 19)
    expect(resolveFixtureId('United States', 'Paraguay', index)?.id).toBe(19);
    // Using alias
    expect(resolveFixtureId('USA', 'Paraguay', index)?.id).toBe(19);
  });
});
