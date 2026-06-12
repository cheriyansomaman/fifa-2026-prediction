const TEAM_MAP: Record<string, string> = {
  // Korea
  'Korea Republic': 'South Korea',
  'Republic of Korea': 'South Korea',

  // Iran
  'IR Iran': 'Iran',
  'Islamic Republic of Iran': 'Iran',

  // Turkey
  'Turkey': 'Türkiye',

  // Ivory Coast
  "Cote d'Ivoire": 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  "Côte D'Ivoire": 'Ivory Coast',

  // DR Congo
  'DR Congo': 'Congo DR',
  'Democratic Republic of Congo': 'Congo DR',
  'Congo, DR': 'Congo DR',

  // Bosnia
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',

  // Curacao
  'Curacao': 'Curaçao',

  // Cape Verde
  'Cabo Verde': 'Cape Verde',
  'Cape Verde Islands': 'Cape Verde',

  // Czechia
  'Czech Republic': 'Czechia',

  // USA
  'USA': 'United States',
};

export function normalizeTeam(name: string): string {
  return TEAM_MAP[name] ?? name;
}
