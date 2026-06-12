import type { FdMatch, FdMatchesResponse } from './types';

const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';

function getToken(): string {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error('FOOTBALL_DATA_TOKEN env var is not set');
  return token;
}

function authHeaders(): Record<string, string> {
  return { 'X-Auth-Token': getToken() };
}

async function fetchMatches(query: string): Promise<FdMatch[]> {
  const url = `${BASE_URL}/competitions/${COMPETITION}/matches?${query}`;
  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`football-data.org ${res.status}: ${body}`);
  }

  const data = (await res.json()) as FdMatchesResponse;
  return data.matches ?? [];
}

export async function fetchLiveMatches(): Promise<FdMatch[]> {
  return fetchMatches('status=IN_PLAY,PAUSED');
}

export async function fetchTodayFinished(): Promise<FdMatch[]> {
  const today = new Date().toISOString().slice(0, 10);
  return fetchMatches(`status=FINISHED&dateFrom=${today}&dateTo=${today}`);
}
