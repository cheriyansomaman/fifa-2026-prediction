import type { CSSProperties } from 'react';

type MatchFilter = 'upcoming' | 'live' | 'finished' | 'bracket';

const FILTER_LABELS: Record<MatchFilter, string> = {
  upcoming: 'Upcoming',
  live: 'Live',
  finished: 'Finished',
  bracket: 'Bracket',
};

interface MatchFilterToggleProps {
  value: MatchFilter;
  onChange: (filter: MatchFilter) => void;
  style?: CSSProperties;
  filters?: MatchFilter[];
}

export function MatchFilterToggle({ value, onChange, style, filters = ['upcoming', 'finished'] }: MatchFilterToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        width: 'fit-content',
        ...style,
      }}
    >
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          style={{
            padding: '7px 20px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 1,
            border: 'none',
            background: value === f ? '#00C460' : '#0f172a',
            color: value === f ? '#fff' : '#64748b',
            transition: 'background 150ms, color 150ms',
          }}
        >
          {FILTER_LABELS[f]}
        </button>
      ))}
    </div>
  );
}

export type { MatchFilter };
