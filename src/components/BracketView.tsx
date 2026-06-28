import { useAppStore } from '../store/useAppStore';
import { flag } from '../data/logic';
import type { Fixture, Result } from '../types';

const CARD_H = 56;
const BASE_GAP = 8;
const UNIT = CARD_H + BASE_GAP;

const ROUNDS = [
  { stage: 'r32', label: 'R32' },
  { stage: 'r16', label: 'R16' },
  { stage: 'qf',  label: 'QF'  },
  { stage: 'sf',  label: 'SF'  },
  { stage: 'final', label: 'Final' },
] as const;

function TeamRow({ name, goals, winner }: { name: string; goals?: number; winner: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 8px',
        background: winner ? 'rgba(0,196,96,0.12)' : 'transparent',
        borderRadius: 4,
      }}
    >
      <span style={{ fontSize: 12, color: winner ? '#00C460' : '#cbd5e1', fontWeight: winner ? 700 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{flag(name)}</span>
        <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      </span>
      {goals !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 700, color: winner ? '#00C460' : '#94a3b8', marginLeft: 6 }}>{goals}</span>
      )}
    </div>
  );
}

function BracketCard({ fixture, result }: { fixture: Fixture; result?: Result }) {
  const hg = result?.homeGoals !== undefined ? Number(result.homeGoals) : undefined;
  const ag = result?.awayGoals !== undefined ? Number(result.awayGoals) : undefined;
  const hasResult = hg !== undefined && ag !== undefined;

  let homeWin = false;
  let awayWin = false;
  if (hasResult) {
    if (hg > ag) homeWin = true;
    else if (ag > hg) awayWin = true;
    else if (result?.penaltyWinner) {
      homeWin = result.penaltyWinner === fixture.home;
      awayWin = result.penaltyWinner === fixture.away;
    } else if (result?.homePenGoals !== undefined && result?.awayPenGoals !== undefined) {
      homeWin = result.homePenGoals > result.awayPenGoals;
      awayWin = result.awayPenGoals > result.homePenGoals;
    }
  }

  return (
    <div
      style={{
        height: CARD_H,
        minWidth: 160,
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        flexShrink: 0,
      }}
    >
      <TeamRow name={fixture.home} goals={hg} winner={homeWin} />
      <div style={{ height: 1, background: '#1e293b', margin: '0 8px' }} />
      <TeamRow name={fixture.away} goals={ag} winner={awayWin} />
    </div>
  );
}

export function BracketView() {
  const { ko, results } = useAppStore();

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 'max-content' }}>
        {ROUNDS.map(({ stage, label }, i) => {
          const fixtures = ko
            .filter((f) => f.stage === stage)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const multiplier = Math.pow(2, i);
          const paddingTop = ((multiplier - 1) * UNIT) / 2;
          const gap = multiplier * UNIT - CARD_H;

          return (
            <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap,
                  paddingTop,
                }}
              >
                {fixtures.map((f) => (
                  <BracketCard key={f.id} fixture={f} result={results[f.id]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
