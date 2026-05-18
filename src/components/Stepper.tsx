import { useState } from 'react';

interface StepperProps {
  label?: string;
  initialValue: number;
  accent: string;
  onChange: (v: number) => void;
  size?: 'sm' | 'lg';
}

export function Stepper({ label, initialValue, accent, onChange, size = 'lg' }: StepperProps) {
  const [val, setVal] = useState<number>(Number.isFinite(Number(initialValue)) ? Number(initialValue) : 0);
  const [minusHover, setMinusHover] = useState(false);
  const [plusHover, setPlusHover] = useState(false);

  const isSm = size === 'sm';
  const dim = isSm ? '32px' : '60px';
  const btnW = isSm ? '26px' : '42px';
  const fs = isSm ? 15 : 28;
  const btnFs = isSm ? 14 : 20;
  const br = isSm ? 7 : 12;

  const clamp = (n: number) => Math.max(0, Math.min(20, n));

  const decrement = () => {
    const next = clamp(val - 1);
    setVal(next);
    onChange(next);
  };

  const increment = () => {
    const next = clamp(val + 1);
    setVal(next);
    onChange(next);
  };

  const btnBase: React.CSSProperties = {
    width: btnW,
    height: dim,
    background: minusHover || plusHover ? `${accent}33` : `${accent}22`,
    border: `1.5px solid ${accent}55`,
    color: accent,
    fontSize: btnFs,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 150ms',
    borderRadius: br,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isSm ? 2 : 6 }}>
      {label && (
        <span style={{ fontSize: isSm ? 9 : 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: isSm ? 3 : 6 }}>
        <button
          onClick={decrement}
          style={{ ...btnBase, background: minusHover ? `${accent}33` : `${accent}22` }}
          onMouseEnter={() => setMinusHover(true)}
          onMouseLeave={() => setMinusHover(false)}
          aria-label="Decrease"
          type="button"
        >
          −
        </button>
        <div
          style={{
            width: dim,
            height: dim,
            background: '#0a1628',
            border: `2px solid ${accent}44`,
            borderRadius: br,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: fs,
            fontWeight: 700,
            color: '#f1f5f9',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {val}
        </div>
        <button
          onClick={increment}
          style={{ ...btnBase, background: plusHover ? `${accent}33` : `${accent}22` }}
          onMouseEnter={() => setPlusHover(true)}
          onMouseLeave={() => setPlusHover(false)}
          aria-label="Increase"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
