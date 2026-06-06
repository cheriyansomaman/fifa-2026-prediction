import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

function buildWaLink(countryCode: string, whatsapp: string, pw: string, name: string): string {
  const num = countryCode.replace('+', '') + whatsapp.replace(/\D/g, '');
  const text = encodeURIComponent(`Hi ${name}! Your temporary FIFA 2026 prediction league password is: ${pw}\n\nPlease log in and change it immediately.`);
  return `https://wa.me/${num}?text=${text}`;
}

function buildWaDismissLink(countryCode: string, whatsapp: string, name: string): string {
  const num = countryCode.replace('+', '') + whatsapp.replace(/\D/g, '');
  const text = encodeURIComponent(`Hi ${name}, your password recovery request for the FIFA 2026 prediction league has been dismissed. This is likely because no WhatsApp number or a different WhatsApp number is registered to this username. Please contact the admin directly if you need further help.`);
  return `https://wa.me/${num}?text=${text}`;
}

export function UsersTab() {
  const { users, pwRequests, tempPwDisplay, generateTempForUser, dismissTempPw, dismissPwRequest } =
    useAppStore();
  const [unverifiedConfirmed, setUnverifiedConfirmed] = useState<Record<string, boolean>>({});

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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tempPwDisplay.whatsapp && tempPwDisplay.countryCode && (
              <a
                href={buildWaLink(tempPwDisplay.countryCode, tempPwDisplay.whatsapp, tempPwDisplay.pw, users[tempPwDisplay.uid] ?? tempPwDisplay.uid)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sport btn-green"
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📲 Send via WhatsApp
              </a>
            )}
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
        </div>
      )}

      {/* Pending password requests */}
      {Object.keys(pwRequests).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              fontWeight: 900,
              color: '#fbbf24',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            Pending Password Requests ({Object.keys(pwRequests).length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(pwRequests).map(([id, req]) => {
              const isVerified = req.verified ?? false;
              const canGenerate = isVerified || (unverifiedConfirmed[id] ?? false);
              return (
                <div
                  key={id}
                  style={{
                    background: '#1c1002',
                    border: '1.5px solid #f59e0b55',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{req.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {req.countryCode} {req.whatsapp}
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontFamily: 'monospace' }}>
                        {new Date(req.requestedAt).toLocaleString()}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {isVerified ? (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#4ade80',
                            background: '#052e16', border: '1px solid #16a34a',
                            borderRadius: 5, padding: '2px 8px',
                          }}>
                            ✓ Verified
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#f87171',
                            background: '#450a0a', border: '1px solid #7f1d1d',
                            borderRadius: 5, padding: '2px 8px',
                          }}>
                            ⚠ UNVERIFIED — verify identity manually
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
                      <button
                        onClick={() =>
                          generateTempForUser(req.uid, {
                            requestId: id,
                            whatsapp: req.whatsapp,
                            countryCode: req.countryCode,
                          })
                        }
                        disabled={!canGenerate}
                        className="btn-sport btn-amber"
                        style={{
                          padding: '6px 14px',
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: canGenerate ? 'pointer' : 'not-allowed',
                          opacity: canGenerate ? 1 : 0.45,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                        type="button"
                      >
                        Generate &amp; Send
                      </button>
                      {req.whatsapp && (
                        <button
                          type="button"
                          onClick={async () => {
                            await dismissPwRequest(id);
                            window.open(
                              buildWaDismissLink(req.countryCode, req.whatsapp, req.name),
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                          style={{
                            background: 'transparent',
                            border: '1.5px solid #334155',
                            color: '#94a3b8',
                            borderRadius: 7,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          📲 Dismiss &amp; Notify
                        </button>
                      )}
                      <button
                        onClick={() => dismissPwRequest(id)}
                        style={{
                          background: 'transparent',
                          border: '1.5px solid #334155',
                          color: '#64748b',
                          borderRadius: 7,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        type="button"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {!isVerified && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={unverifiedConfirmed[id] ?? false}
                        onChange={(e) =>
                          setUnverifiedConfirmed((prev) => ({ ...prev, [id]: e.target.checked }))
                        }
                      />
                      <span style={{ fontSize: 11, color: '#f87171' }}>
                        I have verified this user's identity via another channel
                      </span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
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
