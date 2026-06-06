import type { Result } from '../types';
import { standings } from '../data/logic';
import { FlagImg } from './FlagImg';

interface StandingsTableProps {
  group: string;
  results: Record<number, Result>;
  qualifyingThirds?: Set<string>;
}

const RANK_COLORS: Record<number, string> = {
  0: '#4ade80',
  1: '#4ade80',
  2: '#fbbf24',
};

const DIRECT_QUALIFIER_BADGES: Record<number, { label: string; bg: string; color: string }> = {
  0: { label: 'W', bg: 'rgba(22,163,74,0.2)', color: '#4ade80' },
  1: { label: 'RU', bg: 'rgba(22,163,74,0.2)', color: '#4ade80' },
};

export function StandingsTable({ group, results, qualifyingThirds }: StandingsTableProps) {
  const rows = standings(group, results);
  const anyPlayed = rows.some((r) => r.p > 0);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
          {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
            <th
              key={h}
              style={{
                textAlign: h === 'Team' ? 'left' : 'center',
                padding: '4px 6px',
                fontWeight: 600,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.name} style={{ color: RANK_COLORS[i] ?? '#94a3b8' }}>
            <td style={{ textAlign: 'center', padding: '5px 6px', fontWeight: 700 }}>{i + 1}</td>
            <td style={{ padding: '5px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FlagImg name={row.name} size={16} />
                <span style={{ fontWeight: 600 }}>{row.name}</span>
                {anyPlayed && (() => {
                  const direct = DIRECT_QUALIFIER_BADGES[i];
                  if (direct) return (
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 6px', borderRadius: 4, background: direct.bg, color: direct.color, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                      {direct.label}
                    </span>
                  );
                  if (i === 2 && qualifyingThirds?.has(row.name)) {
                    return (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 6px', borderRadius: 4, background: 'rgba(22,163,74,0.15)', color: '#4ade80', whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                        To32
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </td>
            <td style={{ textAlign: 'center', padding: '5px 6px' }}>{row.p}</td>
            <td style={{ textAlign: 'center', padding: '5px 6px' }}>{row.w}</td>
            <td style={{ textAlign: 'center', padding: '5px 6px' }}>{row.d}</td>
            <td style={{ textAlign: 'center', padding: '5px 6px' }}>{row.l}</td>
            <td style={{ textAlign: 'center', padding: '5px 6px' }}>
              {row.gd > 0 ? `+${row.gd}` : row.gd}
            </td>
            <td style={{ textAlign: 'center', padding: '5px 6px', fontWeight: 700 }}>{row.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
