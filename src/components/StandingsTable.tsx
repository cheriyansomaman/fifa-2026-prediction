import type { Result } from '../types';
import { standings } from '../data/logic';
import { FlagImg } from './FlagImg';

interface StandingsTableProps {
  group: string;
  results: Record<number, Result>;
}

const RANK_COLORS: Record<number, string> = {
  0: '#4ade80',
  1: '#4ade80',
  2: '#fbbf24',
};

export function StandingsTable({ group, results }: StandingsTableProps) {
  const rows = standings(group, results);

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
