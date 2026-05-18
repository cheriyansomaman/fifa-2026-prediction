import { useAppStore } from '../store/useAppStore';
import { GROUPS } from '../data/constants';
import { StandingsTable } from '../components/StandingsTable';

export function GroupsTab() {
  const { results } = useAppStore();

  return (
    <div className="groups-grid">
      {Object.keys(GROUPS).map((group) => (
        <div
          key={group}
          style={{
            background: '#0a1628',
            border: '1.5px solid #16a34a22',
            borderRadius: 12,
            padding: '16px 14px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: '#4ade80',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            Group {group}
          </h3>
          <StandingsTable group={group} results={results} />
        </div>
      ))}
    </div>
  );
}
