import 'dotenv/config';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Result } from '../../src/types';
import { fetchLiveMatches, fetchTodayFinished } from './apiClient';
import { buildFixtureIndex, resolveFixtureId } from './fixtureMapper';
import { toResult } from './resultTransformer';

const POLL_INTERVAL_MS = 30_000;

function initFirebase(): void {
  const inlineKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (inlineKey) {
    initializeApp({ credential: cert(JSON.parse(inlineKey)) });
  } else {
    initializeApp({ credential: applicationDefault() });
  }
}

initFirebase();
const db = getFirestore();

const finalizedIds = new Set<number>();

async function tick(): Promise<void> {
  try {
    const resultsSnap = await db.doc('app/results').get();
    const currentResults = (resultsSnap.data() ?? {}) as Record<number, Result>;

    const [live, finished] = await Promise.all([
      fetchLiveMatches(),
      fetchTodayFinished(),
    ]);

    const matches = [...live, ...finished];

    if (matches.length === 0) {
      console.log(`[${new Date().toISOString()}] No active matches`);
      return;
    }

    const fixtureIndex = buildFixtureIndex(currentResults);
    const updates: Record<string, unknown> = {};

    for (const m of matches) {
      const id = resolveFixtureId(m.homeTeam.name, m.awayTeam.name, fixtureIndex);
      if (id === null) {
        console.warn(`Unmatched: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.utcDate})`);
        continue;
      }
      if (finalizedIds.has(id)) continue;
      updates[String(id)] = toResult(m);
      if (m.status === 'FINISHED' || m.status === 'AWARDED') {
        finalizedIds.add(id);
      }
    }

    if (Object.keys(updates).length === 0) return;

    await db.doc('app/results').set(updates, { merge: true });
    console.log(`[${new Date().toISOString()}] Updated ${Object.keys(updates).length} fixture(s)`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err instanceof Error ? err.stack : err);
  }
}

console.log(`Live score sync starting — polling every ${POLL_INTERVAL_MS / 1000}s`);
tick();
setInterval(tick, POLL_INTERVAL_MS);
