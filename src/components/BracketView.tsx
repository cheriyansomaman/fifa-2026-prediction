import { useMemo } from 'react';
import type { Fixture, Result, Stage } from '../types';
import { FlagImg } from './FlagImg';

interface BracketViewProps {
  ko: Fixture[];
  results: Record<number, Result>;
}

const ROUNDS: { stage: Stage; label: string }[] = [
  { stage: 'r32', label: 'Round of 32' },
  { stage: 'r16', label: 'Round of 16' },
  { stage: 'qf', label: 'Quarter-Finals' },
  { stage: 'sf', label: 'Semi-Finals' },
  { stage: 'final', label: 'Final' },
];

const MATCH_W = 188;
const MATCH_H = 60;
const FIRST_GAP = 16;
const COL_GAP = 32;
const LINE_COLOR = '#334155';

interface LaidOutMatch {
  fixture: Fixture;
  centerY: number;
}

interface LaidOutRound {
  stage: Stage;
  label: string;
  matches: LaidOutMatch[];
}

function layoutRounds(ko: Fixture[]): LaidOutRound[] {
  const rounds = ROUNDS.map(({ stage, label }) => ({
    stage,
    label,
    fixtures: ko.filter((f) => f.stage === stage).sort((a, b) => a.id - b.id),
  })).filter((r) => r.fixtures.length > 0);

  const laidOut: LaidOutRound[] = [];

  rounds.forEach((round, idx) => {
    const matches: LaidOutMatch[] = idx === 0
      ? round.fixtures.map((fixture, i) => ({
          fixture,
          centerY: i * (MATCH_H + FIRST_GAP) + MATCH_H / 2,
        }))
      : round.fixtures.map((fixture, i) => {
          const prev = laidOut[idx - 1].matches;
          return {
            fixture,
            centerY: (prev[2 * i].centerY + prev[2 * i + 1].centerY) / 2,
          };
        });

    laidOut.push({ stage: round.stage, label: round.label, matches });
  });

  return laidOut;
}

function TeamRow({ team, goals, isWinner }: { team: string; goals?: number; isWinner: boolean }) {
  const isUnknown = team === 'TBD' || team === 'TBC';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: MATCH_H / 2 - 1, opacity: isUnknown ? 0.5 : 1 }}>
      <FlagImg name={team} size={16} />
      <span
        title={team}
        style={{
          flex: 1,
          fontSize: 11,
          fontWeight: isWinner ? 700 : 500,
          color: isWinner ? '#3DFFA3' : '#e2e8f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {team}
      </span>
      <span style={{ fontSize: 12, fontWeight: 800, color: isWinner ? '#3DFFA3' : '#94a3b8', minWidth: 14, textAlign: 'right' }}>
        {goals ?? ''}
      </span>
    </div>
  );
}

function MatchBox({ fixture, results }: { fixture: Fixture; results: Record<number, Result> }) {
  const res = results[fixture.id];
  const matchStatus = res?.matchStatus;
  const isLive = matchStatus === 'IN_PLAY' || matchStatus === 'PAUSED';
  const isFinished = matchStatus === 'FINISHED' || matchStatus === 'AWARDED';
  const homeWin = isFinished && res?.winner === fixture.home;
  const awayWin = isFinished && res?.winner === fixture.away;

  const borderColor = isLive ? '#f97316' : isFinished ? '#00C460' : '#1e293b';

  return (
    <div
      style={{
        width: MATCH_W,
        height: MATCH_H,
        background: '#10172a',
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <TeamRow team={fixture.home} goals={res?.homeGoals} isWinner={homeWin} />
      <div style={{ height: 1, background: '#1e293b' }} />
      <TeamRow team={fixture.away} goals={res?.awayGoals} isWinner={awayWin} />
    </div>
  );
}

function Connector({ topY, bottomY }: { topY: number; bottomY: number }) {
  const half = COL_GAP / 2;
  const midY = (topY + bottomY) / 2;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: MATCH_W,
          top: topY,
          width: half,
          height: bottomY - topY,
          borderTop: `2px solid ${LINE_COLOR}`,
          borderRight: `2px solid ${LINE_COLOR}`,
          borderBottom: `2px solid ${LINE_COLOR}`,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: MATCH_W + half,
          top: midY,
          width: half,
          height: 0,
          borderTop: `2px solid ${LINE_COLOR}`,
        }}
      />
    </>
  );
}

export function BracketView({ ko, results }: BracketViewProps) {
  const rounds = useMemo(() => layoutRounds(ko), [ko]);

  if (rounds.length === 0) return null;

  const totalHeight = Math.max(...rounds[0].matches.map((m) => m.centerY)) + MATCH_H / 2;

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 12 }}>
      <div style={{ display: 'flex', width: 'fit-content' }}>
        {rounds.map((round, idx) => {
          const isLast = idx === rounds.length - 1;
          return (
            <div key={round.stage} style={{ width: isLast ? MATCH_W : MATCH_W + COL_GAP, flexShrink: 0 }}>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 14,
                }}
              >
                {round.label}
              </div>
              <div style={{ position: 'relative', height: totalHeight }}>
                {round.matches.map((m) => (
                  <div key={m.fixture.id} style={{ position: 'absolute', left: 0, top: m.centerY - MATCH_H / 2 }}>
                    <MatchBox fixture={m.fixture} results={results} />
                  </div>
                ))}
                {!isLast &&
                  round.matches.map((m, i) => {
                    if (i % 2 !== 0) return null;
                    const next = round.matches[i + 1];
                    return <Connector key={`c-${m.fixture.id}`} topY={m.centerY} bottomY={next.centerY} />;
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
