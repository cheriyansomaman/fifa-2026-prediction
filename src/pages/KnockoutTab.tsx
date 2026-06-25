import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MatchCard } from '../components/MatchCard';
import type { Stage } from '../types';

const KO_ROUNDS: { stage: Stage; label: string }[] = [
  { stage: 'r32', label: 'Round of 32' },
  { stage: 'r16', label: 'Round of 16' },
  { stage: 'qf', label: 'Quarter-Finals' },
  { stage: 'sf', label: 'Semi-Finals' },
  { stage: 'final', label: 'Final' },
];

type MatchFilter = 'upcoming' | 'finished';

export function KnockoutTab() {
  const { ko, results } = useAppStore();
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('upcoming');

  const hasAny = ko.length > 0;
  const isFinished = (id: number) => results[id]?.homeGoals !== undefined;

  const visibleRounds = KO_ROUNDS.map(({ stage, label }) => {
    const fixtures = ko
      .filter((f) => f.stage === stage)
      .filter((f) => matchFilter === 'finished' ? isFinished(f.id) : !isFinished(f.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { stage, label, fixtures };
  }).filter(({ fixtures }) => fixtures.length > 0);

  return (
    <div>
      {hasAny && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 10, overflow: 'hidden', border: '1px solid #1e293b', width: 'fit-content' }}>
          {(['upcoming', 'finished'] as MatchFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setMatchFilter(f)}
              style={{
                padding: '7px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1,
                border: 'none',
                background: matchFilter === f ? '#00C460' : '#0f172a',
                color: matchFilter === f ? '#fff' : '#64748b',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {f === 'upcoming' ? 'Upcoming' : 'Finished'}
            </button>
          ))}
        </div>
      )}

      {visibleRounds.map(({ stage, label, fixtures }) => (
        <div key={stage} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: '#f1f5f9',
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginBottom: 14,
              borderLeft: '3px solid #16a34a',
              paddingLeft: 12,
            }}
          >
            {label}
          </h2>
          <div className="ko-grid">
            {fixtures.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}

      {hasAny && visibleRounds.length === 0 && (
        <div style={{ color: '#475569', textAlign: 'center', padding: 40, fontSize: 14 }}>
          No {matchFilter} knockout matches
        </div>
      )}

      {!hasAny && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Knockout stage not yet generated</div>
          <div style={{ fontSize: 13 }}>Results from the group stage will determine the bracket</div>
        </div>
      )}
    </div>
  );
}
