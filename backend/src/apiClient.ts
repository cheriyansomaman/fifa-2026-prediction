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
  // LIVE covers extra time and penalty shootout phases in the v4 API
  return fetchMatches('status=LIVE,IN_PLAY,PAUSED');
}

export async function fetchRecentFinished(): Promise<FdMatch[]> {
  // Use a 2-day window (yesterday + today UTC) because football-data.org filters
  // by the match's scheduled utcDate, not when it actually finished. A US evening
  // kickoff on June 14 local time can have utcDate=2026-06-14 but finish on June 15.
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateTo = today.toISOString().slice(0, 10);
  const dateFrom = yesterday.toISOString().slice(0, 10);
  return fetchMatches(`status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`);
}
