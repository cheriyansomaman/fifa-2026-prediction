import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ModalOverlay, ModalActions } from '../shared';

export function EditTeamModal() {
  const { modal, setModal, setKoTeamOverride, saving } = useAppStore();

  if (!modal || modal.type !== 'editTeam') return null;
  const { fixture, side } = modal;

  const current = side === 'home' ? fixture.home : fixture.away;
  const [name, setName] = useState(current === 'TBD' || current === 'TBC' ? '' : current);

  const handleSave = () => {
    if (!name.trim()) return;
    setKoTeamOverride(fixture.id, side, name);
  };

  return (
    <ModalOverlay onClose={() => setModal(null)} borderColor="#7c3aed">
      <h3
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: '#c4b5fd',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 20,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        Fix Team Name (Admin)
      </h3>

      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center' }}>
        {fixture.label ?? fixture.stage.toUpperCase()} &mdash; {side === 'home' ? 'Home' : 'Away'} slot
        <br />
        Currently: <strong style={{ color: '#e2e8f0' }}>{current}</strong>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Team name"
        autoFocus
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1.5px solid #334155',
          background: '#0f172a',
          color: '#e2e8f0',
          fontSize: 14,
          marginBottom: 16,
          boxSizing: 'border-box',
        }}
      />

      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 20, textAlign: 'center' }}>
        This permanently overrides this slot for all users until changed again.
      </div>

      <ModalActions
        onCancel={() => setModal(null)}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save"
        saveClassName="btn-sport btn-green"
      />
    </ModalOverlay>
  );
}
