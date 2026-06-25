import { Stepper } from '../Stepper';

interface PenaltySteppersProps {
  homeTeam: string;
  awayTeam: string;
  homePen: number;
  awayPen: number;
  onHomePenChange: (v: number) => void;
  onAwayPenChange: (v: number) => void;
  accent?: string;
  borderColor?: string;
  label?: string;
}

export function PenaltySteppers({
  homeTeam,
  awayTeam,
  homePen,
  awayPen,
  onHomePenChange,
  onAwayPenChange,
  accent = '#8b5cf6',
  borderColor = '#1e3a5f',
  label = 'Draw after 90 min \u2014 Penalty shootout winner',
}: PenaltySteppersProps) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Stepper
          label={homeTeam}
          initialValue={homePen}
          accent={accent}
          onChange={onHomePenChange}
          size="sm"
        />
        <span style={{ fontSize: 18, color: '#475569', fontWeight: 700 }}>&ndash;</span>
        <Stepper
          label={awayTeam}
          initialValue={awayPen}
          accent={accent}
          onChange={onAwayPenChange}
          size="sm"
        />
      </div>
    </div>
  );
}
