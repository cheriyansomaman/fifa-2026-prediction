import { useEffect, useRef, useState } from 'react';
import logoUrl from '../wc2026-logo.png';
import { useAppStore } from '../store/useAppStore';
import { GF } from '../data/constants';
import { calcPts } from '../data/logic';

export function Header() {
  const { uid, users, isAdmin, logout, preds, results, ko, updateDisplayName } = useAppStore();
  const displayName = uid ? (users[uid] ?? uid) : null;

  const [isDropOpen, setIsDropOpen] = useState(false);
  const [isEditingInDrop, setIsEditingInDrop] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  const myScore = uid
    ? [...GF, ...ko].reduce((sum, f) => {
        const pred = preds[uid]?.[f.id];
        const res = results[f.id];
        if (!pred || !res || res.homeGoals === undefined) return sum;
        return sum + calcPts(pred, res, f);
      }, 0)
    : 0;

  useEffect(() => {
    if (!isDropOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) {
        setIsDropOpen(false);
        setIsEditingInDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropOpen]);

  const saveDisplayName = () => {
    const t = nameInput.trim();
    if (t && t !== displayName) updateDisplayName(t);
    setIsDropOpen(false);
    setIsEditingInDrop(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(135deg, #0F1528 0%, #161F3A 55%, #111E30 100%)',
        borderBottom: '1px solid #00C46030',
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
                color: '#3DFFA3',
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

            {/* Score */}
            {myScore > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#3DFFA3',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {myScore}
                </div>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>pts</div>
              </div>
            )}

            {/* Name + dropdown */}
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  if (!isDropOpen) setIsEditingInDrop(false);
                  setIsDropOpen((o) => !o);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 6px',
                  borderRadius: 6,
                  transition: 'background 150ms',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </div>
                  {isAdmin && (
                    <div style={{ fontSize: 10, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                      Admin
                    </div>
                  )}
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12"
                  style={{ color: '#64748b', flexShrink: 0, transition: 'transform 150ms', transform: isDropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {isDropOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#1D2240',
                    border: '1px solid #2A3050',
                    borderRadius: 10,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
                    minWidth: 210,
                    zIndex: 200,
                    padding: 6,
                  }}
                >
                  {!isEditingInDrop ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingInDrop(true);
                        setNameInput(displayName ?? '');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#e2e8f0',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '8px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Barlow', sans-serif",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#252C4A')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 14 }}>✏️</span>
                      Change Display Name
                    </button>
                  ) : (
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Display Name
                      </div>
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveDisplayName();
                          if (e.key === 'Escape') setIsEditingInDrop(false);
                        }}
                        maxLength={30}
                        style={{
                          width: '100%',
                          background: '#0F1528',
                          border: '1px solid #2A3050',
                          borderRadius: 6,
                          color: '#e2e8f0',
                          fontSize: 13,
                          padding: '7px 10px',
                          outline: 'none',
                          marginBottom: 8,
                          fontFamily: "'Barlow', sans-serif",
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={saveDisplayName}
                          style={{
                            flex: 1,
                            background: '#00C460',
                            border: 'none',
                            borderRadius: 6,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '7px',
                            cursor: 'pointer',
                            fontFamily: "'Barlow', sans-serif",
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingInDrop(false)}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            color: '#64748b',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '7px',
                            cursor: 'pointer',
                            fontFamily: "'Barlow', sans-serif",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
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
