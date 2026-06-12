import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GF } from '../data/constants';
import { calcPts } from '../data/logic';
import { UserPredictionsModal } from '../components/UserPredictionsModal';

const MEDALS: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

const RANK_STYLES: Record<number, { border: string; bg: string; shadow: string }> = {
  0: { border: '#f59e0b', bg: '#1c1002', shadow: 'lb-gold' },
  1: { border: '#94a3b8', bg: '#0f1623', shadow: 'lb-silver' },
  2: { border: '#b87333', bg: '#130e08', shadow: 'lb-bronze' },
};

function getRankStyle(rank: number) {
  return RANK_STYLES[rank] ?? { border: '#1e3a5f', bg: '#0a1628', shadow: 'lb-other' };
}

export function LeaderboardTab() {
  const { users, preds, results, ko, setModal, allPredsLoading, refreshLeaderboard } = useAppStore();
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const allFixtures = [...GF, ...ko];

  const scores = Object.entries(users).map(([uid, name]) => {
    const userPreds = preds[uid] ?? {};
    const pts = allFixtures.reduce((sum, f) => {
      const pred = userPreds[f.id];
      const res = results[f.id];
      if (!pred || !res || res.homeGoals === undefined) return sum;
      return sum + calcPts(pred, res, f);
    }, 0);
    return { uid, name, pts };
  });

  scores.sort((a, b) => b.pts - a.pts);
  const top20 = scores.slice(0, 20);

  let rankCursor = 0;
  const ranked = top20.map((entry, i) => {
    if (i > 0 && top20[i - 1].pts !== entry.pts) rankCursor = i;
    return { ...entry, rank: rankCursor };
  });

  return (
    <div>
      {/* Header row with rules button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18,
            fontWeight: 900,
            color: '#f1f5f9',
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}
        >
          Leaderboard
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => refreshLeaderboard()}
            disabled={allPredsLoading}
            style={{
              background: 'transparent',
              border: '1.5px solid #1e3a5f',
              color: allPredsLoading ? '#475569' : '#94a3b8',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 16,
              cursor: allPredsLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            type="button"
            title="Refresh scores"
          >
            <span style={{ display: 'inline-block', animation: allPredsLoading ? 'spin 1s linear infinite' : 'none' }}>
              ↻
            </span>
          </button>
          <button
            onClick={() => setModal({ type: 'rules' })}
            style={{
              background: 'transparent',
              border: '1.5px solid #16a34a55',
              color: '#4ade80',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
            type="button"
          >
            Scoring Rules
          </button>
        </div>
      </div>

      <div className="lb-grid">
        {ranked.map(({ uid, name, pts, rank }) => {
          const { border, bg, shadow } = getRankStyle(rank);
          return (
            <div
              key={uid}
              className={shadow}
              onClick={() => setSelectedUid(uid)}
              style={{
                background: bg,
                border: `1.5px solid ${border}55`,
                borderLeft: `3px solid ${border}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'pointer',
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontSize: rank < 3 ? 28 : 18,
                  fontWeight: 900,
                  color: rank < 3 ? border : '#475569',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  minWidth: 36,
                  textAlign: 'center',
                }}
              >
                {MEDALS[rank] ?? rank + 1}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#e2e8f0',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {name}
                </div>
              </div>

              {/* Points */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: rank === 0 ? '#fbbf24' : rank === 1 ? '#94a3b8' : rank === 2 ? '#b87333' : '#4ade80',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {pts}
                </div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 }}>pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {allPredsLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569', fontSize: 14 }}>
          <div className="spin" style={{ fontSize: 28, marginBottom: 8 }}>⚽</div>
          Loading scores…
        </div>
      )}

      {!allPredsLoading && scores.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569', fontSize: 14 }}>
          No players yet
        </div>
      )}

      {selectedUid && (
        <UserPredictionsModal
          uid={selectedUid}
          name={users[selectedUid] ?? selectedUid}
          onClose={() => setSelectedUid(null)}
        />
      )}
    </div>
  );
}
