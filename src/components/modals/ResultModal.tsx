import { useState } from 'react';
import type { Result } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Stepper } from '../Stepper';

export function ResultModal() {
  const { modal, results, enterResult, setModal, saving } = useAppStore();

  if (!modal || modal.type !== 'result') return null;
  const { fixture } = modal;

  const existing: Result = results[fixture.id] ?? {};
  const isKO = fixture.stage !== 'group';

  const [hg, setHg] = useState<number>(existing.homeGoals ?? 0);
  const [ag, setAg] = useState<number>(existing.awayGoals ?? 0);
  const [homePen, setHomePen] = useState<number>(existing.homePenGoals ?? 0);
  const [awayPen, setAwayPen] = useState<number>(existing.awayPenGoals ?? 0);

  const showPens = isKO && hg === ag;

  const handleSave = () => {
    const result: Result = { homeGoals: hg, awayGoals: ag };
    if (showPens) {
      result.homePenGoals = homePen;
      result.awayPenGoals = awayPen;
      result.penaltyWinner = homePen > awayPen ? fixture.home : fixture.away;
    }
    enterResult(fixture, result);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setModal(null);
  };

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
      }}
    >
      <div
        className="modal-box"
        style={{
          background: '#0a1628',
          border: '1.5px solid #b4530955',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 420,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#fbbf24',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 20,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          Enter Result (Admin)
        </h3>

        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, textAlign: 'center' }}>
          {fixture.home} vs {fixture.away}
        </div>

        {/* Score steppers */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
          <Stepper
            label={fixture.home}
            initialValue={hg}
            accent="#f59e0b"
            onChange={setHg}
          />
          <span style={{ fontSize: 24, color: '#475569', fontWeight: 700, marginTop: 18 }}>–</span>
          <Stepper
            label={fixture.away}
            initialValue={ag}
            accent="#f59e0b"
            onChange={setAg}
          />
        </div>

        {/* Penalty steppers (KO only, when draw) */}
        {isKO && showPens && (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #451a03',
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
              Draw after 90 min — Penalty shootout
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <Stepper
                label={fixture.home}
                initialValue={homePen}
                accent="#f59e0b"
                onChange={setHomePen}
                size="sm"
              />
              <span style={{ fontSize: 18, color: '#475569', fontWeight: 700 }}>–</span>
              <Stepper
                label={fixture.away}
                initialValue={awayPen}
                accent="#f59e0b"
                onChange={setAwayPen}
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setModal(null)}
            style={{
              padding: '8px 18px',
              background: 'transparent',
              border: '1.5px solid #334155',
              color: '#94a3b8',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-sport btn-amber"
            style={{
              padding: '8px 22px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
            type="button"
          >
            {saving ? 'Saving…' : existing.homeGoals !== undefined ? 'Update' : 'Enter Result'}
          </button>
        </div>
      </div>
    </div>
  );
}
