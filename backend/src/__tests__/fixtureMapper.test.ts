import { describe, it, expect } from 'vitest';
import { buildFixtureIndex, resolveFixtureId } from '../fixtureMapper';

describe('buildFixtureIndex', () => {
  it('builds an index containing all 72 group fixtures', () => {
    const index = buildFixtureIndex({});
    // 72 group fixtures + KO fixtures with TBC teams (skipped)
    expect(index.size).toBeGreaterThanOrEqual(72);
  });

  it('maps normalized team names as keys', () => {
    const index = buildFixtureIndex({});
    // Mexico vs South Africa is fixture 1
    expect(index.get('Mexico|South Africa')).toBe(1);
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
    const id = resolveFixtureId('Mexico', 'South Africa', index);
    expect(id).toBe(1);
  });

  it('resolves with API team name aliases (normalized)', () => {
    const index = buildFixtureIndex({});
    // "Korea Republic" normalizes to "South Korea"
    // South Korea vs Czechia is fixture id=2
    const id = resolveFixtureId('Korea Republic', 'Czech Republic', index);
    expect(id).toBe(2);
  });

  it('returns null for unknown fixture', () => {
    const index = buildFixtureIndex({});
    const id = resolveFixtureId('Atlantis', 'Mordor', index);
    expect(id).toBeNull();
  });

  it('is order-sensitive (home vs away matters)', () => {
    const index = buildFixtureIndex({});
    const forward = resolveFixtureId('Mexico', 'South Africa', index);
    const reverse = resolveFixtureId('South Africa', 'Mexico', index);
    // Only the correct home-away order should match
    expect(forward).toBe(1);
    // Reverse might match a different fixture or be null
    // In group A, fixture 6 is South Africa vs South Korea, not SA vs Mexico
    // So reverse should be null
    expect(reverse).toBeNull();
  });

  it('resolves various group fixtures correctly', () => {
    const index = buildFixtureIndex({});

    // Group B: Canada vs Bosnia & Herzegovina (fixture 7)
    expect(resolveFixtureId('Canada', 'Bosnia & Herzegovina', index)).toBe(7);
    // Using API alias
    expect(resolveFixtureId('Canada', 'Bosnia and Herzegovina', index)).toBe(7);

    // Group D: United States vs Paraguay (fixture 19)
    expect(resolveFixtureId('United States', 'Paraguay', index)).toBe(19);
    // Using alias
    expect(resolveFixtureId('USA', 'Paraguay', index)).toBe(19);
  });
});
