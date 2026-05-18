import { useAppStore } from '../store/useAppStore';

export function UsersTab() {
  const { users, tempPwDisplay, generateTempForUser, dismissTempPw } = useAppStore();

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 18,
          fontWeight: 900,
          color: '#f1f5f9',
          textTransform: 'uppercase',
          letterSpacing: 3,
          marginBottom: 20,
        }}
      >
        Users
      </h2>

      {/* Temp password display banner */}
      {tempPwDisplay && (
        <div
          className="toast-msg"
          style={{
            background: '#1c1002',
            border: '1.5px solid #f59e0b55',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
            Temporary Password for: {users[tempPwDisplay.uid] ?? tempPwDisplay.uid}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 700,
              color: '#f1f5f9',
              background: '#0a0f1e',
              borderRadius: 8,
              padding: '10px 16px',
              letterSpacing: 2,
              marginBottom: 10,
              wordBreak: 'break-all',
            }}
          >
            {tempPwDisplay.pw}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
            Share this password with the user. They will be asked to change it on first login.
          </div>
          <button
            onClick={dismissTempPw}
            style={{
              background: 'transparent',
              border: '1.5px solid #334155',
              color: '#94a3b8',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(users).map(([uid, name]) => (
          <div
            key={uid}
            style={{
              background: '#0a1628',
              border: '1.5px solid #1e293b',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {/* Name */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{name}</div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#475569',
                  marginTop: 2,
                }}
              >
                {uid}
              </div>
            </div>

            {/* Gen Temp PW button */}
            <button
              onClick={() => generateTempForUser(uid)}
              className="btn-sport btn-amber"
              style={{
                padding: '6px 16px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
              type="button"
            >
              Gen Temp PW
            </button>
          </div>
        ))}
      </div>

      {Object.keys(users).length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontSize: 14 }}>
          No users registered yet
        </div>
      )}
    </div>
  );
}
