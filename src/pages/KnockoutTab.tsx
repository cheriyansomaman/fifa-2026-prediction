import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MatchCard } from '../components/MatchCard';
import { BracketView } from '../components/BracketView';
import { SectionHeading, EmptyState } from '../components/shared';
import type { Stage } from '../types';

const KO_ROUNDS: { stage: Stage; label: string }[] = [
  { stage: 'r32', label: 'Round of 32' },
  { stage: 'r16', label: 'Round of 16' },
  { stage: 'qf', label: 'Quarter-Finals' },
  { stage: 'sf', label: 'Semi-Finals' },
  { stage: 'final', label: 'Final' },
];

type KOFilter = 'upcoming' | 'finished' | 'brackets';

const KO_FILTERS: { value: KOFilter; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'finished', label: 'Finished' },
  { value: 'brackets', label: 'Brackets' },
];

export function KnockoutTab() {
  const { ko, results } = useAppStore();
  const [matchFilter, setMatchFilter] = useState<KOFilter>('upcoming');

  const hasAny = ko.length > 0;
  const isFinished = (id: number) => results[id]?.homeGoals !== undefined;

  const visibleRounds = matchFilter === 'brackets' ? [] : KO_ROUNDS.map(({ stage, label }) => {
    const fixtures = ko
      .filter((f) => f.stage === stage)
      .filter((f) => matchFilter === 'finished' ? isFinished(f.id) : !isFinished(f.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { stage, label, fixtures };
  }).filter(({ fixtures }) => fixtures.length > 0);

  return (
    <div>
      {hasAny && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid #1e293b',
            width: 'fit-content',
            marginBottom: 24,
          }}
        >
          {KO_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMatchFilter(value)}
              style={{
                padding: '7px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1,
                border: 'none',
                background: matchFilter === value ? '#00C460' : '#0f172a',
                color: matchFilter === value ? '#fff' : '#64748b',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {matchFilter === 'brackets' && hasAny && <BracketView ko={ko} results={results} />}

      {matchFilter !== 'brackets' && visibleRounds.map(({ stage, label, fixtures }) => (
        <div key={stage} style={{ marginBottom: 32 }}>
          <SectionHeading accentColor="#16a34a">{label}</SectionHeading>
          <div className="ko-grid">
            {fixtures.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}

      {matchFilter !== 'brackets' && hasAny && visibleRounds.length === 0 && (
        <div style={{ color: '#475569', textAlign: 'center', padding: 40, fontSize: 14 }}>
          No {matchFilter} knockout matches
        </div>
      )}

      {!hasAny && (
        <EmptyState
          icon="⚽"
          message="Knockout stage not yet generated"
          subtitle="Results from the group stage will determine the bracket"
        />
      )}
    </div>
  );
}
