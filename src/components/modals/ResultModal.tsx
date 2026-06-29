import { useState } from 'react';
import type { Result } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Stepper } from '../Stepper';
import { ModalOverlay, ModalActions, PenaltySteppers } from '../shared';

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
    const result: Result = { homeGoals: hg, awayGoals: ag, matchStatus: 'FINISHED' };
    if (showPens) {
      result.homePenGoals = homePen;
      result.awayPenGoals = awayPen;
      result.penaltyWinner = homePen > awayPen ? fixture.home : fixture.away;
      result.winner = result.penaltyWinner;
    } else if (hg !== ag) {
      result.winner = hg > ag ? fixture.home : fixture.away;
    }
    enterResult(fixture, result);
  };

  return (
    <ModalOverlay onClose={() => setModal(null)} borderColor="#b45309">
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
        <span style={{ fontSize: 24, color: '#475569', fontWeight: 700, marginTop: 18 }}>&ndash;</span>
        <Stepper
          label={fixture.away}
          initialValue={ag}
          accent="#f59e0b"
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
          accent="#f59e0b"
          borderColor="#451a03"
          label="Draw after 90 min — Penalty shootout"
        />
      )}

      {/* Actions */}
      <ModalActions
        onCancel={() => setModal(null)}
        onSave={handleSave}
        saving={saving}
        saveLabel={existing.homeGoals !== undefined ? 'Update' : 'Enter Result'}
        saveClassName="btn-sport btn-amber"
      />
    </ModalOverlay>
  );
}
