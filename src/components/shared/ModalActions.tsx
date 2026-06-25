interface ModalActionsProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
  savingLabel?: string;
  saveClassName?: string;
}

export function ModalActions({
  onCancel,
  onSave,
  saving,
  saveLabel = 'Save',
  savingLabel = 'Saving\u2026',
  saveClassName = 'btn-sport btn-green',
}: ModalActionsProps) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button
        onClick={onCancel}
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
        onClick={onSave}
        disabled={saving}
        className={saveClassName}
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
        {saving ? savingLabel : saveLabel}
      </button>
    </div>
  );
}
