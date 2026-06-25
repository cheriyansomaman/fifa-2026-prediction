import { useState } from 'react';
import type { Prediction } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Stepper } from '../Stepper';
import { ModalOverlay, ModalActions, PenaltySteppers } from '../shared';

export function PredictModal() {
  const { modal, uid, preds, predict, setModal, saving } = useAppStore();

  if (!modal || modal.type !== 'predict') return null;
  const { fixture } = modal;

  const existing: Prediction = (uid ? preds[uid]?.[fixture.id] : undefined) ?? {};
  const isKO = fixture.stage !== 'group';

  const [hg, setHg] = useState<number>(existing.homeGoals ?? 0);
  const [ag, setAg] = useState<number>(existing.awayGoals ?? 0);
  const [homePen, setHomePen] = useState<number>(existing.homePenGoals ?? 0);
  const [awayPen, setAwayPen] = useState<number>(existing.awayPenGoals ?? 0);

  const showPens = isKO && hg === ag;

  const handleSave = () => {
    const pred: Prediction = { homeGoals: hg, awayGoals: ag };
    if (showPens) {
      pred.homePenGoals = homePen;
      pred.awayPenGoals = awayPen;
      pred.penaltyWinner = homePen > awayPen ? fixture.home : fixture.away;
    }
    predict(fixture, pred);
  };

  return (
    <ModalOverlay onClose={() => setModal(null)} borderColor="#1d4ed8">
      <h3
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: '#93c5fd',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 20,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        Predict
      </h3>

      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, textAlign: 'center' }}>
        {fixture.home} vs {fixture.away}
      </div>

      {/* Score steppers */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
        <Stepper
          label={fixture.home}
          initialValue={hg}
          accent="#3b82f6"
          onChange={setHg}
        />
        <span style={{ fontSize: 24, color: '#475569', fontWeight: 700, marginTop: 18 }}>&ndash;</span>
        <Stepper
          label={fixture.away}
          initialValue={ag}
          accent="#3b82f6"
          onChange={setAg}
        />
      </div>

      {/* Penalty steppers (KO only, when draw) */}
      {isKO && showPens && (
        <PenaltySteppers
          homeTeam={fixture.home}
          awayTeam={fixture.away}
          homePen={homePen}
          awayPen={awayPen}
          onHomePenChange={setHomePen}
          onAwayPenChange={setAwayPen}
          accent="#8b5cf6"
          borderColor="#1e3a5f"
          label="Draw after 90 min — Penalty shootout winner"
        />
      )}

      {/* Actions */}
      <ModalActions
        onCancel={() => setModal(null)}
        onSave={handleSave}
        saving={saving}
        saveClassName="btn-sport btn-green"
      />
    </ModalOverlay>
  );
}
