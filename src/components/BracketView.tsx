import { useAppStore } from '../store/useAppStore';
import { flag } from '../data/logic';
import type { Fixture, Result } from '../types';

const CARD_W = 152;
const CARD_H = 52;
const GAP = 8;
const UNIT = CARD_H + GAP;         // 60px per R32 slot
const COL_GAP = 20;                 // horizontal gap between rounds (for connectors)
const COL_STRIDE = CARD_W + COL_GAP;
const NUM_ROUNDS = 5;
const NUM_SLOTS = 16;               // R32 has 16 matches
const TOTAL_H = NUM_SLOTS * UNIT;  // 960px
const TOTAL_W = (NUM_ROUNDS - 1) * COL_STRIDE + CARD_W;
const HEADER_H = 24;
const LINE_COLOR = '#334155';

// Explicit bracket display order reflects actual pairing topology.
// R16 #3(203) pairs with R16 #8(208) for QF #2, so they appear adjacent.
const BRACKET_ORDER: Record<string, number[]> = {
  r32:   [101, 104, 102, 105, 109, 110, 116, 115, 111, 112, 103, 106, 107, 108, 113, 114],
  r16:   [201, 202, 203, 208, 204, 205, 206, 207],
  qf:    [301, 302, 303, 304],
  sf:    [401, 402],
  final: [501],
};

const ROUNDS = [
  { stage: 'r32',   label: 'Round of 32' },
  { stage: 'r16',   label: 'Round of 16' },
  { stage: 'qf',    label: 'Quarter-Finals' },
  { stage: 'sf',    label: 'Semi-Finals' },
  { stage: 'final', label: 'Final' },
] as const;

function cardX(round: number) { return round * COL_STRIDE; }

function cardY(round: number, match: number) {
  const slots = Math.pow(2, round);
  const slotH = slots * UNIT;
  return match * slotH + (slotH - CARD_H) / 2;
}

function cardCenterY(round: number, match: number) {
  return cardY(round, match) + CARD_H / 2;
}

function orderedFixtures(ko: Fixture[], stage: string): Fixture[] {
  const order = BRACKET_ORDER[stage] ?? [];
  const byId = new Map(ko.map(f => [f.id, f]));
  return order.map(id => byId.get(id)).filter((f): f is Fixture => f !== undefined);
}

function ConnectorLines({ ko }: { ko: Fixture[] }) {
  const segs: React.ReactElement[] = [];

  ROUNDS.forEach(({ stage }, ri) => {
    if (ri >= NUM_ROUNDS - 1) return;

    const count = orderedFixtures(ko, stage).length;
    const x1 = cardX(ri) + CARD_W;
    const x2 = cardX(ri + 1);
    const xm = x1 + (x2 - x1) / 2;

    for (let j = 0; j < count; j += 2) {
      const y1 = cardCenterY(ri, j);
      const y2 = cardCenterY(ri, j + 1);
      const ym = (y1 + y2) / 2;
      segs.push(
        <g key={`c-${ri}-${j}`}>
          <line x1={x1} y1={y1} x2={xm} y2={y1} stroke={LINE_COLOR} strokeWidth={1} />
          <line x1={x1} y1={y2} x2={xm} y2={y2} stroke={LINE_COLOR} strokeWidth={1} />
          <line x1={xm} y1={y1} x2={xm} y2={y2} stroke={LINE_COLOR} strokeWidth={1} />
          <line x1={xm} y1={ym} x2={x2} y2={ym} stroke={LINE_COLOR} strokeWidth={1} />
        </g>,
      );
    }
  });

  return <>{segs}</>;
}

function TeamRow({ name, goals, win }: { name: string; goals?: number; win: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 7px',
      height: '50%',
      background: win ? 'rgba(0,196,96,0.12)' : 'transparent',
    }}>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        overflow: 'hidden',
        fontSize: 11,
        fontWeight: win ? 700 : 400,
        color: win ? '#00C460' : '#cbd5e1',
      }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{flag(name)}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      </span>
      {goals !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 700, color: win ? '#00C460' : '#94a3b8', marginLeft: 4, flexShrink: 0 }}>
          {goals}
        </span>
      )}
    </div>
  );
}

function BracketCard({ f, result, x, y }: { f: Fixture; result?: Result; x: number; y: number }) {
  const hg = result?.homeGoals !== undefined ? Number(result.homeGoals) : undefined;
  const ag = result?.awayGoals !== undefined ? Number(result.awayGoals) : undefined;
  const played = hg !== undefined && ag !== undefined && Number.isFinite(hg) && Number.isFinite(ag);

  let homeWin = false;
  let awayWin = false;
  if (played) {
    if (hg > ag) { homeWin = true; }
    else if (ag > hg) { awayWin = true; }
    else if (result?.penaltyWinner) {
      homeWin = result.penaltyWinner === f.home;
      awayWin = result.penaltyWinner === f.away;
    } else if (result?.homePenGoals !== undefined && result?.awayPenGoals !== undefined) {
      homeWin = result.homePenGoals > result.awayPenGoals;
      awayWin = !homeWin;
    }
  }

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: CARD_W,
      height: CARD_H,
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: 7,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <TeamRow name={f.home} goals={hg} win={homeWin} />
      <div style={{ height: 1, background: '#1e293b', flexShrink: 0 }} />
      <TeamRow name={f.away} goals={ag} win={awayWin} />
    </div>
  );
}

export function BracketView() {
  const { ko, results } = useAppStore();

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: TOTAL_H + HEADER_H }}>

        {/* Round labels */}
        {ROUNDS.map(({ stage, label }, ri) => (
          <div
            key={stage}
            style={{
              position: 'absolute',
              left: cardX(ri),
              top: 0,
              width: CARD_W,
              textAlign: 'center',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#475569',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        ))}

        {/* Connector lines */}
        <svg
          style={{ position: 'absolute', left: 0, top: HEADER_H, overflow: 'visible', pointerEvents: 'none' }}
          width={TOTAL_W}
          height={TOTAL_H}
        >
          <ConnectorLines ko={ko} />
        </svg>

        {/* Match cards */}
        {ROUNDS.map(({ stage }, ri) => {
          const fixtures = orderedFixtures(ko, stage);
          return fixtures.map((f, mi) => (
            <BracketCard
              key={f.id}
              f={f}
              result={results[f.id]}
              x={cardX(ri)}
              y={cardY(ri, mi) + HEADER_H}
            />
          ));
        })}

      </div>
    </div>
  );
}
