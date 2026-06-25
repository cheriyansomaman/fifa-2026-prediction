import { describe, it, expect } from 'vitest';
import { normalizeTeam } from '../teamMapping';

describe('normalizeTeam', () => {
  it('returns the canonical name for known aliases', () => {
    expect(normalizeTeam('Korea Republic')).toBe('South Korea');
    expect(normalizeTeam('Republic of Korea')).toBe('South Korea');
    expect(normalizeTeam('IR Iran')).toBe('Iran');
    expect(normalizeTeam('Islamic Republic of Iran')).toBe('Iran');
    expect(normalizeTeam('Turkey')).toBe('Türkiye');
    expect(normalizeTeam("Cote d'Ivoire")).toBe('Ivory Coast');
    expect(normalizeTeam("Côte d'Ivoire")).toBe('Ivory Coast');
    expect(normalizeTeam("Côte D'Ivoire")).toBe('Ivory Coast');
    expect(normalizeTeam('DR Congo')).toBe('Congo DR');
    expect(normalizeTeam('Democratic Republic of Congo')).toBe('Congo DR');
    expect(normalizeTeam('Congo, DR')).toBe('Congo DR');
    expect(normalizeTeam('Bosnia and Herzegovina')).toBe('Bosnia & Herzegovina');
    expect(normalizeTeam('Bosnia-Herzegovina')).toBe('Bosnia & Herzegovina');
    expect(normalizeTeam('Curacao')).toBe('Curaçao');
    expect(normalizeTeam('Cabo Verde')).toBe('Cape Verde');
    expect(normalizeTeam('Cape Verde Islands')).toBe('Cape Verde');
    expect(normalizeTeam('Czech Republic')).toBe('Czechia');
    expect(normalizeTeam('USA')).toBe('United States');
  });

  it('returns the input unchanged for already-canonical names', () => {
    expect(normalizeTeam('Brazil')).toBe('Brazil');
    expect(normalizeTeam('Germany')).toBe('Germany');
    expect(normalizeTeam('France')).toBe('France');
    expect(normalizeTeam('England')).toBe('England');
    expect(normalizeTeam('South Korea')).toBe('South Korea');
    expect(normalizeTeam('Iran')).toBe('Iran');
    expect(normalizeTeam('Türkiye')).toBe('Türkiye');
    expect(normalizeTeam('Ivory Coast')).toBe('Ivory Coast');
    expect(normalizeTeam('Congo DR')).toBe('Congo DR');
    expect(normalizeTeam('Bosnia & Herzegovina')).toBe('Bosnia & Herzegovina');
    expect(normalizeTeam('Curaçao')).toBe('Curaçao');
    expect(normalizeTeam('Cape Verde')).toBe('Cape Verde');
    expect(normalizeTeam('Czechia')).toBe('Czechia');
    expect(normalizeTeam('United States')).toBe('United States');
  });

  it('returns the input unchanged for unknown team names', () => {
    expect(normalizeTeam('Atlantis')).toBe('Atlantis');
    expect(normalizeTeam('')).toBe('');
  });
});
