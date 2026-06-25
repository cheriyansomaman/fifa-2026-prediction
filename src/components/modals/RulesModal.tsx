import { useAppStore } from '../../store/useAppStore';
import { ModalOverlay } from '../shared';

interface RuleRow {
  outcome: string;
  pts: string;
  example: string;
}

const GROUP_RULES: RuleRow[] = [
  { outcome: 'Exact score', pts: '5', example: 'e.g. predict 3–1, result 3–1' },
  { outcome: 'Correct winner + same goal diff', pts: '4', example: 'e.g. predict 5–2 (GD+3), result 3–0 (GD+3)' },
  { outcome: 'Correct winner + different goal diff', pts: '3', example: 'e.g. predict 5–2, result 4–1' },
  { outcome: 'Predict draw, result draw, exact score', pts: '5', example: 'e.g. predict 1–1, result 1–1' },
  { outcome: 'Predict draw, result draw, different score', pts: '3', example: 'e.g. predict 1–1, result 0–0' },
  { outcome: 'Predict winner or loser, result is draw', pts: '1', example: 'e.g. predict 2–1, result 1–1' },
  { outcome: 'Predict draw, result is decisive', pts: '0', example: 'e.g. predict 1–1, result 2–1' },
  { outcome: 'Wrong winner', pts: '0', example: 'e.g. predict 1–2, result 3–0' },
];

const KO_RULES: RuleRow[] = [
  { outcome: 'Exact score (90 min)', pts: '5', example: 'e.g. predict 3–1, result 3–1' },
  { outcome: 'Correct winner + same goal diff', pts: '4', example: '...' },
  { outcome: 'Correct winner + different goal diff', pts: '3', example: '...' },
  { outcome: 'Predict draw (exact score) + correct pen winner', pts: '4+1', example: '...' },
  { outcome: 'Predict draw (diff score) + correct pen winner', pts: '3+1', example: '...' },
  { outcome: 'Predict draw, wrong pen winner', pts: '4', example: '...' },
  { outcome: 'Predict winner via pen (draw at 90\')', pts: '4', example: '...' },
  { outcome: 'Predict winner or loser, result is draw', pts: '1', example: '...' },
  { outcome: 'Predict draw, result is decisive', pts: '0', example: '...' },
  { outcome: 'Wrong winner', pts: '0', example: '...' },
];

function RulesSection({ title, rows }: { title: string; rows: RuleRow[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#4ade80',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 10,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {title}
      </h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ color: '#64748b' }}>
            <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>
              Outcome
            </th>
            <th style={{ textAlign: 'center', padding: '5px 8px', fontWeight: 600, borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
              Pts
            </th>
            <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 600, borderBottom: '1px solid #1e293b', display: 'table-cell' }}
              className="hide-mobile"
            >
              Example
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.outcome} style={{ borderBottom: '1px solid #0f172a' }}>
              <td style={{ padding: '6px 8px', color: '#cbd5e1' }}>{row.outcome}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>{row.pts}</td>
              <td style={{ padding: '6px 8px', color: '#475569', fontSize: 11 }}>{row.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RulesModal() {
  const { modal, setModal } = useAppStore();

  if (!modal || modal.type !== 'rules') return null;

  return (
    <ModalOverlay onClose={() => setModal(null)} borderColor="#16a34a" maxWidth={640} scrollable>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#f1f5f9',
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          Scoring Rules
        </h3>
        <button
          onClick={() => setModal(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            lineHeight: 1,
          }}
          aria-label="Close rules"
          type="button"
        >
          ✕
        </button>
      </div>

      <RulesSection title="Group Stage" rows={GROUP_RULES} />
      <RulesSection title="Knockout Stage" rows={KO_RULES} />
    </ModalOverlay>
  );
}
