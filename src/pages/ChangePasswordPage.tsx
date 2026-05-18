import { useAppStore } from '../store/useAppStore';

export function ChangePasswordPage() {
  const { newPwVal, confirmPwVal, changeError, saving, setNewPwVal, setConfirmPwVal, changePassword } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword();
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="login-card"
        style={{
          background: '#0a1628',
          border: '1.5px solid #f59e0b33',
          borderRadius: 16,
          padding: '36px 32px',
          width: '100%',
          maxWidth: 380,
        }}
      >
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            color: '#fbbf24',
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Change Password
        </h2>
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 28 }}>
          You must set a new password before continuing
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPwVal}
              onChange={(e) => setNewPwVal(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1.5px solid #1e293b',
                borderRadius: 8,
                color: '#f1f5f9',
                padding: '10px 14px',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPwVal}
              onChange={(e) => setConfirmPwVal(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1.5px solid #1e293b',
                borderRadius: 8,
                color: '#f1f5f9',
                padding: '10px 14px',
                fontSize: 14,
              }}
            />
          </div>

          {changeError && (
            <div
              className="toast-msg"
              style={{
                background: '#450a0a',
                border: '1px solid #7f1d1d',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                color: '#f87171',
                marginBottom: 16,
              }}
            >
              {changeError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !newPwVal || !confirmPwVal}
            className="btn-sport btn-amber"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 800,
              cursor: saving || !newPwVal || !confirmPwVal ? 'not-allowed' : 'pointer',
              opacity: saving || !newPwVal || !confirmPwVal ? 0.6 : 1,
            }}
          >
            {saving ? 'Updating…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
