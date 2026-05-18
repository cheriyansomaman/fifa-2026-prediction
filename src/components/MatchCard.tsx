import { useState } from 'react';
import type { Fixture } from '../types';
import { useAppStore } from '../store/useAppStore';
import { calcPts, predOpen, fmtDate } from '../data/logic';
import { FlagImg } from './FlagImg';

interface MatchCardProps {
  fixture: Fixture;
}

function getBorderColor(hasRes: boolean, hasPred: boolean, isTBC: boolean, open: boolean): string {
  if (hasRes) return '#16a34a';
  if (hasPred) return '#1d4ed8';
  if (isTBC) return '#1e293b';
  if (open) return '#1e3a5f';
  return '#7f1d1d';
}

function getBgColor(hasRes: boolean, hasPred: boolean, isTBC: boolean, open: boolean): string {
  if (hasRes) return '#052e16';
  if (hasPred) return '#0c1a3a';
  if (isTBC) return '#0f172a';
  if (open) return '#0a1a30';
  return '#1c0a0a';
}

export function MatchCard({ fixture }: MatchCardProps) {
  const { uid, isAdmin, preds, results, setModal } = useAppStore();
  const [predHover, setPredHover] = useState(false);
  const [resultHover, setResultHover] = useState(false);

  const res = results[fixture.id];
  const myPred = uid ? preds[uid]?.[fixture.id] : undefined;

  const hasRes = res !== undefined && res !== null && (res.homeGoals !== undefined);
  const hasPred = myPred !== undefined && myPred !== null && (myPred.homeGoals !== undefined);
  const isTBC = fixture.home === 'TBD' || fixture.away === 'TBD';
  const open = predOpen(fixture.date);

  const borderColor = getBorderColor(hasRes, hasPred, isTBC, open);
  const bgColor = getBgColor(hasRes, hasPred, isTBC, open);

  const pts = hasRes && hasPred ? calcPts(myPred, res, fixture) : null;

  const scoreDisplay = hasRes
    ? `${res.homeGoals} – ${res.awayGoals}`
    : 'VS';

  const statusBadge = isTBC ? null : open ? (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#4ade80',
        background: '#052e16',
        border: '1px solid #16a34a44',
        borderRadius: 4,
        padding: '2px 7px',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      ● OPEN
    </span>
  ) : hasRes ? null : (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#f87171',
        background: '#450a0a',
        border: '1px solid #7f1d1d44',
        borderRadius: 4,
        padding: '2px 7px',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      CLOSED
    </span>
  );

  const tbcBadge = isTBC ? (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#94a3b8',
        background: '#1e293b',
        border: '1px solid #33415544',
        borderRadius: 4,
        padding: '2px 7px',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      COMING SOON
    </span>
  ) : null;

  return (
    <div
      className="match-card"
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}55`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {fixture.label ?? (fixture.group ? `Group ${fixture.group}` : fixture.stage.toUpperCase())}
          {fixture.matchNum ? ` · #${fixture.matchNum}` : ''}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {statusBadge}
          {tbcBadge}
          {pts !== null && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#4ade80',
                background: '#052e16',
                border: '1px solid #16a34a55',
                borderRadius: 4,
                padding: '2px 8px',
                letterSpacing: 0.5,
              }}
            >
              +{pts} pts
            </span>
          )}
        </div>
      </div>

      {/* Teams row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Home team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
          <FlagImg name={fixture.home} size={36} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.2 }}>
            {fixture.home}
          </span>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', minWidth: 60 }}>
          <div
            style={{
              fontSize: hasRes ? 26 : 16,
              fontWeight: 800,
              color: hasRes ? '#4ade80' : '#475569',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: hasRes ? 2 : 1,
            }}
          >
            {scoreDisplay}
          </div>
          {hasRes && res.homePenGoals !== undefined && res.awayPenGoals !== undefined && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              ({res.homePenGoals} – {res.awayPenGoals} pens)
            </div>
          )}
        </div>

        {/* Away team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
          <FlagImg name={fixture.away} size={36} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.2 }}>
            {fixture.away}
          </span>
        </div>
      </div>

      {/* Date & Venue */}
      <div style={{ textAlign: 'center', marginTop: 8, color: '#64748b', fontSize: 11 }}>
        {fmtDate(fixture.date)} · {fixture.venue}
      </div>

      {/* Prediction section */}
      {uid && !isTBC && (hasPred || !hasRes) && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid #1e293b',
          }}
        >
          {hasPred && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Your prediction
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#93c5fd' }}>
                {myPred.homeGoals} – {myPred.awayGoals}
                {myPred.homePenGoals !== undefined && myPred.awayPenGoals !== undefined && (
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                    {' '}({myPred.homePenGoals} – {myPred.awayPenGoals} pens)
                  </span>
                )}
              </div>
            </div>
          )}

          {open && !hasRes && (
            <button
              onClick={() => setModal({ type: 'predict', fixture })}
              className="btn-sport btn-outlined-green"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 6,
                background: 'transparent',
                border: '1.5px solid #16a34a',
                color: '#4ade80',
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
              onMouseEnter={() => setPredHover(true)}
              onMouseLeave={() => setPredHover(false)}
            >
              {hasPred ? 'Edit Prediction' : 'Predict'}
              {predHover && <span />}
            </button>
          )}

          {!hasPred && !open && !hasRes && (
            <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
              Prediction window closed
            </div>
          )}
        </div>
      )}

      {/* Admin enter result */}
      {isAdmin && !hasRes && !isTBC && (
        <div style={{ marginTop: hasPred || (!hasRes && uid) ? 6 : 12 }}>
          <button
            onClick={() => setModal({ type: 'result', fixture })}
            className="btn-sport btn-amber"
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
            onMouseEnter={() => setResultHover(true)}
            onMouseLeave={() => setResultHover(false)}
          >
            Enter Result
            {resultHover && <span />}
          </button>
        </div>
      )}
    </div>
  );
}
