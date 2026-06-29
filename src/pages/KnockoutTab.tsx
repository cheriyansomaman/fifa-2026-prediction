import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MatchCard } from '../components/MatchCard';
import { BracketView } from '../components/BracketView';
import { MatchFilterToggle, SectionHeading, EmptyState } from '../components/shared';
import type { MatchFilter } from '../components/shared';
import type { Stage } from '../types';

const KO_ROUNDS: { stage: Stage; label: string }[] = [
  { stage: 'r32', label: 'Round of 32' },
  { stage: 'r16', label: 'Round of 16' },
  { stage: 'qf', label: 'Quarter-Finals' },
  { stage: 'sf', label: 'Semi-Finals' },
  { stage: 'final', label: 'Final' },
];

export function KnockoutTab() {
  const { ko, results } = useAppStore();
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('upcoming');

  const hasAny = ko.length > 0;
  const isFinished = (id: number) => {
    const res = results[id];
    const hasScore = res?.homeGoals !== undefined;
    const isLive = res?.matchStatus === 'IN_PLAY' || res?.matchStatus === 'PAUSED';
    return hasScore && !isLive;
  };

  const visibleRounds = KO_ROUNDS.map(({ stage, label }) => {
    const fixtures = ko
      .filter((f) => f.stage === stage)
      .filter((f) => matchFilter === 'finished' ? isFinished(f.id) : !isFinished(f.id))
      .sort((a, b) => matchFilter === 'finished'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime());
    return { stage, label, fixtures };
  }).filter(({ fixtures }) => fixtures.length > 0);

  return (
    <div>
      {hasAny && (
        <MatchFilterToggle
          value={matchFilter}
          onChange={setMatchFilter}
          filters={['upcoming', 'finished', 'bracket']}
          style={{ marginBottom: 24 }}
        />
      )}

      {matchFilter === 'bracket' && <BracketView />}

      {matchFilter !== 'bracket' && visibleRounds.map(({ stage, label, fixtures }) => (
        <div key={stage} style={{ marginBottom: 32 }}>
          <SectionHeading accentColor="#16a34a">{label}</SectionHeading>
          <div className="ko-grid">
            {fixtures.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}

      {matchFilter !== 'bracket' && hasAny && visibleRounds.length === 0 && (
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
