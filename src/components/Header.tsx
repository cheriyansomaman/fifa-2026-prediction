import logoUrl from '../wc2026-logo.png';
import { useAppStore } from '../store/useAppStore';

export function Header() {
  const { uid, users, isAdmin, logout } = useAppStore();
  const displayName = uid ? (users[uid] ?? uid) : null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(135deg, #020c14 0%, #0a1628 60%, #051a0d 100%)',
        borderBottom: '1px solid #16a34a33',
        height: 68,
      }}
    >
      <div className="app-inner" style={{ height: '100%', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoUrl} alt="WC 2026" style={{ height: 44, width: 'auto' }} />
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 18,
                color: '#f1f5f9',
                textTransform: 'uppercase',
                letterSpacing: 3,
                lineHeight: 1,
              }}
            >
              WC 2026
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#4ade80',
                textTransform: 'uppercase',
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              Prediction League
            </div>
          </div>
        </div>

        {/* User info */}
        {uid && displayName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{displayName}</div>
              {isAdmin && (
                <div
                  style={{
                    fontSize: 10,
                    color: '#fbbf24',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Admin
                </div>
              )}
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1.5px solid #334155',
                color: '#94a3b8',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'border-color 150ms, color 150ms',
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
