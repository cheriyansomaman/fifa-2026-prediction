import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸🇨🇦 +1 (US/CA)' },
  { code: '+7', label: '🇷🇺 +7 (RU)' },
  { code: '+20', label: '🇪🇬 +20 (EG)' },
  { code: '+27', label: '🇿🇦 +27 (ZA)' },
  { code: '+31', label: '🇳🇱 +31 (NL)' },
  { code: '+33', label: '🇫🇷 +33 (FR)' },
  { code: '+34', label: '🇪🇸 +34 (ES)' },
  { code: '+39', label: '🇮🇹 +39 (IT)' },
  { code: '+44', label: '🇬🇧 +44 (UK)' },
  { code: '+49', label: '🇩🇪 +49 (DE)' },
  { code: '+51', label: '🇵🇪 +51 (PE)' },
  { code: '+52', label: '🇲🇽 +52 (MX)' },
  { code: '+54', label: '🇦🇷 +54 (AR)' },
  { code: '+55', label: '🇧🇷 +55 (BR)' },
  { code: '+56', label: '🇨🇱 +56 (CL)' },
  { code: '+57', label: '🇨🇴 +57 (CO)' },
  { code: '+58', label: '🇻🇪 +58 (VE)' },
  { code: '+60', label: '🇲🇾 +60 (MY)' },
  { code: '+61', label: '🇦🇺 +61 (AU)' },
  { code: '+62', label: '🇮🇩 +62 (ID)' },
  { code: '+63', label: '🇵🇭 +63 (PH)' },
  { code: '+64', label: '🇳🇿 +64 (NZ)' },
  { code: '+65', label: '🇸🇬 +65 (SG)' },
  { code: '+66', label: '🇹🇭 +66 (TH)' },
  { code: '+81', label: '🇯🇵 +81 (JP)' },
  { code: '+82', label: '🇰🇷 +82 (KR)' },
  { code: '+86', label: '🇨🇳 +86 (CN)' },
  { code: '+90', label: '🇹🇷 +90 (TR)' },
  { code: '+91', label: '🇮🇳 +91 (IN)' },
  { code: '+92', label: '🇵🇰 +92 (PK)' },
  { code: '+94', label: '🇱🇰 +94 (LK)' },
  { code: '+212', label: '🇲🇦 +212 (MA)' },
  { code: '+213', label: '🇩🇿 +213 (DZ)' },
  { code: '+216', label: '🇹🇳 +216 (TN)' },
  { code: '+218', label: '🇱🇾 +218 (LY)' },
  { code: '+234', label: '🇳🇬 +234 (NG)' },
  { code: '+254', label: '🇰🇪 +254 (KE)' },
  { code: '+351', label: '🇵🇹 +351 (PT)' },
  { code: '+352', label: '🇱🇺 +352 (LU)' },
  { code: '+353', label: '🇮🇪 +353 (IE)' },
  { code: '+355', label: '🇦🇱 +355 (AL)' },
  { code: '+358', label: '🇫🇮 +358 (FI)' },
  { code: '+380', label: '🇺🇦 +380 (UA)' },
  { code: '+381', label: '🇷🇸 +381 (RS)' },
  { code: '+385', label: '🇭🇷 +385 (HR)' },
  { code: '+386', label: '🇸🇮 +386 (SI)' },
  { code: '+420', label: '🇨🇿 +420 (CZ)' },
  { code: '+421', label: '🇸🇰 +421 (SK)' },
  { code: '+852', label: '🇭🇰 +852 (HK)' },
  { code: '+966', label: '🇸🇦 +966 (SA)' },
  { code: '+971', label: '🇦🇪 +971 (AE)' },
  { code: '+972', label: '🇮🇱 +972 (IL)' },
  { code: '+974', label: '🇶🇦 +974 (QA)' },
  { code: '+977', label: '🇳🇵 +977 (NP)' },
];

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  border: '1.5px solid #1e293b',
  borderRadius: 8,
  color: '#f1f5f9',
  padding: '10px 14px',
  fontSize: 14,
} as const;

export function LoginPage() {
  const {
    nameVal, pwVal, loginError, saving, setNameVal, setPwVal, login, submitPwRequest,
    waVal, waCodeVal, setWaVal, setWaCodeVal,
  } = useAppStore();

  const [showRequest, setShowRequest] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqCode, setReqCode] = useState('+44');
  const [reqWa, setReqWa] = useState('');
  const [reqSaving, setReqSaving] = useState(false);
  const [reqMsg, setReqMsg] = useState('');
  const [reqError, setReqError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = reqName.trim();
    const code = reqCode.trim();
    const wa = reqWa.trim();
    if (!name) { setReqError('Username required'); return; }
    if (!code || code === '+') { setReqError('Country code required'); return; }
    if (!wa) { setReqError('WhatsApp number required'); return; }

    setReqSaving(true);
    setReqError('');
    try {
      await submitPwRequest(name, code, wa);
      setReqMsg('Request sent! Admin will contact you via WhatsApp.');
      setReqName('');
      setReqCode('+');
      setReqWa('');
      setTimeout(() => { setReqMsg(''); setShowRequest(false); }, 3000);
    } catch (err) {
      setReqError(err instanceof Error ? err.message : 'Failed to send request');
    }
    setReqSaving(false);
  };

  const balls = [
    { size: 14, left: 5,  delay: 0,  dur: 12 },
    { size: 20, left: 14, delay: 2,  dur: 16 },
    { size: 16, left: 23, delay: 5,  dur: 14 },
    { size: 24, left: 35, delay: 8,  dur: 20 },
    { size: 12, left: 47, delay: 1,  dur: 13 },
    { size: 18, left: 58, delay: 4,  dur: 17 },
    { size: 22, left: 67, delay: 7,  dur: 15 },
    { size: 14, left: 76, delay: 3,  dur: 19 },
    { size: 20, left: 85, delay: 9,  dur: 11 },
    { size: 16, left: 93, delay: 6,  dur: 18 },
  ];

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.18; }
          50%  { opacity: 0.28; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.15); }
        }
      `}</style>

      {/* Football-themed background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: 'linear-gradient(160deg, #020c14 0%, #031a0a 30%, #05122a 65%, #020c14 100%)' }}>

        {/* Stadium glow blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, #16a34a28 0%, transparent 70%)',
          top: '-8%', left: '-8%', animation: 'glowPulse 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 650, height: 650, borderRadius: '50%',
          background: 'radial-gradient(circle, #1e40af1a 0%, transparent 70%)',
          bottom: '-15%', right: '-12%', animation: 'glowPulse 9s ease-in-out infinite 3s' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, #16a34a18 0%, transparent 70%)',
          top: '35%', right: '20%', animation: 'glowPulse 6s ease-in-out infinite 1.5s' }} />

        {/* Pitch centre-circle */}
        <div style={{ position: 'absolute', left: '50%', bottom: '-120px', transform: 'translateX(-50%)',
          width: 340, height: 340, borderRadius: '50%',
          border: '1.5px solid #16a34a14', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '50%', bottom: '-180px', transform: 'translateX(-50%)',
          width: 2, height: 260, background: '#16a34a10' }} />

        {/* Floating footballs */}
        {balls.map((b, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: '-40px', left: `${b.left}%`,
            fontSize: b.size, lineHeight: 1,
            animation: `floatUp ${b.dur}s linear ${b.delay}s infinite`,
            userSelect: 'none',
          }}>⚽</div>
        ))}

        {/* Trophy + star accents */}
        <div style={{ position: 'absolute', top: '12%', right: '8%', fontSize: 40, opacity: 0.06,
          transform: 'rotate(12deg)' }}>🏆</div>
        <div style={{ position: 'absolute', top: '60%', left: '5%', fontSize: 32, opacity: 0.06,
          transform: 'rotate(-8deg)' }}>🏟️</div>
      </div>

    <div
      style={{
        position: 'relative', zIndex: 1,
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
        {!showRequest ? (
          <>
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

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  Username <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  placeholder="Your name"
                  autoComplete="username"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  Password <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="password"
                  value={pwVal}
                  onChange={(e) => setPwVal(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  WhatsApp <span style={{ color: '#f87171' }}>*</span> <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional for existing accounts)</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={waCodeVal}
                    onChange={(e) => setWaCodeVal(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', minWidth: 120, cursor: 'pointer' }}
                  >
                    {COUNTRY_CODES.map(({ code, label }) => (
                      <option key={code + label} value={code}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={waVal}
                    onChange={(e) => setWaVal(e.target.value)}
                    placeholder="7911123456"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                  Required for new accounts. Ignored if you already have an account.
                </div>
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

            <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowRequest(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Forgot password? Request a temporary one
              </button>
              <a
                href={`https://wa.me/919633282270?text=${encodeURIComponent('Hi Admin of MyFifa26, I need a help.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#4ade80', textDecoration: 'none' }}
              >
                📲 Contact Admin on WhatsApp
              </a>
            </div>
          </>
        ) : (
          <>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 20,
                fontWeight: 900,
                color: '#f1f5f9',
                textTransform: 'uppercase',
                letterSpacing: 3,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Request Temp Password
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Admin will send your temp password via WhatsApp
            </p>

            <form onSubmit={handleRequest}>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="Your registered name"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  Country Code
                </label>
                <select
                  value={reqCode}
                  onChange={(e) => setReqCode(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {COUNTRY_CODES.map(({ code, label }) => (
                    <option key={code + label} value={code}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}
                >
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={reqWa}
                  onChange={(e) => setReqWa(e.target.value)}
                  placeholder="7911123456"
                  style={inputStyle}
                />
              </div>

              {reqError && (
                <div
                  style={{
                    background: '#450a0a',
                    border: '1px solid #7f1d1d',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#f87171',
                    marginBottom: 14,
                  }}
                >
                  {reqError}
                </div>
              )}
              {reqMsg && (
                <div
                  style={{
                    background: '#052e16',
                    border: '1px solid #16a34a',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#4ade80',
                    marginBottom: 14,
                  }}
                >
                  {reqMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={reqSaving}
                className="btn-sport btn-green"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: reqSaving ? 'not-allowed' : 'pointer',
                  opacity: reqSaving ? 0.6 : 1,
                  marginBottom: 10,
                }}
              >
                {reqSaving ? 'Sending…' : 'Send Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowRequest(false)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1.5px solid #334155',
                  color: '#94a3b8',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </>
  );
}
