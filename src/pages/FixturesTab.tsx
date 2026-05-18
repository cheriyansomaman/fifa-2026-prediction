import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GF, GROUPS } from '../data/constants';
import { MatchCard } from '../components/MatchCard';
import { StandingsTable } from '../components/StandingsTable';

const ALL_GROUPS = ['All', ...Object.keys(GROUPS)];

export function FixturesTab() {
  const { ko, results, grpTab, setGrpTab } = useAppStore();
  const [hoverPill, setHoverPill] = useState<string | null>(null);

  const allFixtures = [...GF, ...ko];
  const filteredFixtures = grpTab === 'All'
    ? allFixtures
    : GF.filter((f) => f.group === grpTab);

  return (
    <div>
      {/* Filter pills */}
      <div className="pills-row" style={{ marginBottom: 20 }}>
        {ALL_GROUPS.map((g) => {
          const isActive = grpTab === g;
          const isHover = hoverPill === g;
          return (
            <button
              key={g}
              onClick={() => setGrpTab(g)}
              onMouseEnter={() => setHoverPill(g)}
              onMouseLeave={() => setHoverPill(null)}
              style={{
                background: isActive ? '#16a34a' : isHover ? '#16a34a22' : '#0f172a',
                border: `1.5px solid ${isActive ? '#16a34a' : isHover ? '#16a34a88' : '#1e293b'}`,
                color: isActive ? '#fff' : isHover ? '#4ade80' : '#64748b',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'background 150ms, color 150ms, border-color 150ms',
                minHeight: 'unset',
                flexShrink: 0,
              }}
              type="button"
            >
              {g === 'All' ? 'All' : `Group ${g}`}
            </button>
          );
        })}
      </div>

      <div className="fixtures-cols">
        {/* Match list */}
        <div>
          {filteredFixtures.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
          {filteredFixtures.length === 0 && (
            <div style={{ color: '#475569', textAlign: 'center', padding: 40, fontSize: 14 }}>
              No matches found
            </div>
          )}
        </div>

        {/* Desktop sidebar — standings for selected group */}
        <div className="desktop-sidebar">
          {grpTab !== 'All' && (
            <div
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
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#4ade80',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Group {grpTab} Standings
              </h3>
              <StandingsTable group={grpTab} results={results} />
            </div>
          )}
          {grpTab === 'All' && (
            <div
              style={{
                background: '#0a1628',
                border: '1.5px solid #16a34a22',
                borderRadius: 12,
                padding: '16px 14px',
                color: '#475569',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              Select a group to see standings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
