import 'dotenv/config';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Result } from '../../src/types';
import { fetchLiveMatches, fetchRecentFinished } from './apiClient';
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
const lastKnownResults = new Map<number, string>();

async function tick(): Promise<void> {
  try {
    const resultsSnap = await db.doc('app/results').get();
    const currentResults = (resultsSnap.data() ?? {}) as Record<number, Result>;

    const [live, finished] = await Promise.all([
      fetchLiveMatches(),
      fetchRecentFinished(),
    ]);

    // Deduplicate by match ID — a match can appear in both calls (e.g. just finished)
    const seen = new Set<number>();
    const matches = [...live, ...finished].filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    if (matches.length === 0) {
      console.log(`[${new Date().toISOString()}] No active matches`);
      return;
    }

    const ts = () => new Date().toISOString();

    console.log(`[${ts()}] Fetched ${matches.length} match(es): ${matches.map(m => `${m.homeTeam.name} vs ${m.awayTeam.name} [${m.status}]`).join(', ')}`);

    const fixtureIndex = buildFixtureIndex(currentResults);
    const updates: Record<string, unknown> = {};

    for (const m of matches) {
      const id = resolveFixtureId(m.homeTeam.name, m.awayTeam.name, fixtureIndex);
      if (id === null) {
        console.warn(`[${ts()}] UNMATCHED: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.utcDate})`);
        continue;
      }
      if (finalizedIds.has(id)) {
        console.log(`[${ts()}] SKIP fixture #${id} (${m.homeTeam.name} vs ${m.awayTeam.name}) — already finalized`);
        continue;
      }

      const result = toResult(m);
      const serialized = JSON.stringify(result);
      const prev = lastKnownResults.get(id);

      if (prev === serialized) {
        console.log(`[${ts()}] SKIP fixture #${id} (${m.homeTeam.name} vs ${m.awayTeam.name}) — no change [${m.status}] score: ${result.homeGoals ?? '?'}-${result.awayGoals ?? '?'}`);
        continue;
      }

      console.log(`[${ts()}] QUEUE fixture #${id} (${m.homeTeam.name} vs ${m.awayTeam.name}) [${m.status}] score: ${result.homeGoals ?? '?'}-${result.awayGoals ?? '?'} winner: ${result.winner ?? '-'} prev: ${prev ?? 'none'}`);

      updates[String(id)] = result;
      lastKnownResults.set(id, serialized);

      if (m.status === 'FINISHED' || m.status === 'AWARDED') {
        finalizedIds.add(id);
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log(`[${ts()}] Nothing to write`);
      return;
    }

    await db.doc('app/results').set(updates, { merge: true });
    console.log(`[${ts()}] WROTE ${Object.keys(updates).length} fixture(s) to Firestore: ${Object.keys(updates).join(', ')}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err instanceof Error ? err.stack : err);
  }
}

const maxRunMs = parseInt(process.env.MAX_RUN_SECONDS ?? '0') * 1000;
if (maxRunMs > 0) {
  setTimeout(() => {
    console.log(`[${new Date().toISOString()}] Max run duration reached, exiting.`);
    process.exit(0);
  }, maxRunMs);
}

console.log(`Live score sync starting — polling every ${POLL_INTERVAL_MS / 1000}s`);
tick();
setInterval(tick, POLL_INTERVAL_MS);
