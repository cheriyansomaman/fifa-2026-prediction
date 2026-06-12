import { useAppStore } from '../store/useAppStore';
import { GF } from '../data/constants';
import { predOpen, fmtDate, flag, calcPts } from '../data/logic';
import type { Fixture, Prediction } from '../types';

interface Props {
  uid: string;
  name: string;
  onClose: () => void;
}

function scoreStr(pred: Prediction): string {
  if (pred.homeGoals === undefined || pred.awayGoals === undefined) return '—';
  return `${pred.homeGoals}–${pred.awayGoals}`;
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
        fontFamily: "'Barlow Condensed', sans-serif",
      }}
    >
      {label}
    </div>
  );
}

function FixtureRow({ f, pred, pts, hasRes, resStr }: {
  f: Fixture;
  pred?: Prediction;
  pts: number | null;
  hasRes: boolean;
  resStr: string;
}) {
  const hasPred = pred !== undefined && pred.homeGoals !== undefined;

  return (
    <div
      style={{
        background: '#0f1e36',
        border: '1px solid #1e3a5f',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#e2e8f0',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {flag(f.home)} {f.home}
        </span>
        <span style={{ fontSize: 10, color: '#475569' }}>vs</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#e2e8f0',
            fontFamily: "'Barlow Condensed', sans-serif",
            textAlign: 'right',
          }}
        >
          {f.away} {flag(f.away)}
        </span>
      </div>

      <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>{fmtDate(f.date)}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
            Pred:
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: hasPred ? '#93c5fd' : '#334155',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {hasPred ? scoreStr(pred!) : '—'}
          </span>
          {hasPred && pred!.penaltyWinner && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              (pen: {flag(pred!.penaltyWinner)})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasRes && (
            <span style={{ fontSize: 10, color: '#64748b' }}>
              Result:{' '}
              <span style={{ fontWeight: 700, color: '#4ade80' }}>{resStr}</span>
            </span>
          )}
          {pts !== null && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#fbbf24',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              +{pts}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserPredictionsModal({ uid, name, onClose }: Props) {
  const { preds, results, ko } = useAppStore();
  const allFixtures = [...GF, ...ko];
  const userPreds = preds[uid] ?? {};

  const predicted = allFixtures
    .filter((f) => {
      const p = userPreds[f.id];
      return !predOpen(f.date) && p !== undefined && p.homeGoals !== undefined;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupFixtures = predicted.filter((f) => f.stage === 'group');
  const koFixtures = predicted.filter((f) => f.stage !== 'group');

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  function buildRow(f: Fixture) {
    const pred = userPreds[f.id];
    const res = results[f.id];
    const hasPred = pred !== undefined && pred.homeGoals !== undefined;
    const hasRes = res !== undefined && res.homeGoals !== undefined;
    const pts = hasPred && hasRes ? calcPts(pred, res, f) : null;
    const resStr = hasRes ? `${res.homeGoals}–${res.awayGoals}` : '';

    return (
      <FixtureRow
        key={f.id}
        f={f}
        pred={hasPred ? pred : undefined}
        pts={pts}
        hasRes={hasRes}
        resStr={resStr}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-box"
        style={{
          background: '#0a1628',
          border: '1.5px solid #1e3a5f',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#f1f5f9',
                textTransform: 'uppercase',
                letterSpacing: 2,
                fontFamily: "'Barlow Condensed', sans-serif",
                margin: 0,
              }}
            >
              {name}&apos;s Predictions
            </h3>
            <p
              style={{
                fontSize: 10,
                color: '#475569',
                margin: '4px 0 0',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Latest first
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: 20,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              lineHeight: 1,
            }}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {predicted.length === 0 && (
          <p
            style={{
              color: '#475569',
              fontSize: 13,
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            No closed matches with predictions yet.
          </p>
        )}

        {groupFixtures.length > 0 && (
          <>
            <SectionLabel label="Group Stage" color="#4ade80" />
            {groupFixtures.map(buildRow)}
          </>
        )}

        {koFixtures.length > 0 && (
          <div style={{ marginTop: groupFixtures.length > 0 ? 16 : 0 }}>
            <SectionLabel label="Knockout Stage" color="#f59e0b" />
            {koFixtures.map(buildRow)}
          </div>
        )}
      </div>
    </div>
  );
}
