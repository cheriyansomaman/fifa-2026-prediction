import { useAppStore } from '../store/useAppStore';

export function LoginPage() {
  const { nameVal, pwVal, loginError, saving, setNameVal, setPwVal, login } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
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
          border: '1.5px solid #16a34a33',
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
            color: '#f1f5f9',
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Sign In/Sign Up
        </h2>
        <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 28 }}>
          Enter your credentials to join the prediction league
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
            >
              Username
            </label>
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              placeholder="Your name"
              autoComplete="username"
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
              Password
            </label>
            <input
              type="password"
              value={pwVal}
              onChange={(e) => setPwVal(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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

          {loginError && (
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
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !nameVal.trim() || !pwVal}
            className="btn-sport btn-green"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 800,
              cursor: saving || !nameVal.trim() || !pwVal ? 'not-allowed' : 'pointer',
              opacity: saving || !nameVal.trim() || !pwVal ? 0.6 : 1,
            }}
          >
            {saving ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
