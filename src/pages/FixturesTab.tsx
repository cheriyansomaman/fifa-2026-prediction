import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GF, GROUPS } from '../data/constants';
import { MatchCard } from '../components/MatchCard';
import { StandingsTable } from '../components/StandingsTable';
import { MatchFilterToggle } from '../components/shared';
import type { MatchFilter } from '../components/shared';

const ALL_GROUPS = ['All', ...Object.keys(GROUPS)];

export function FixturesTab() {
  const { ko, results, grpTab, setGrpTab } = useAppStore();
  const [hoverPill, setHoverPill] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('upcoming');
  const [teamFilter, setTeamFilter] = useState('');

  const allFixtures = [...GF, ...ko];
  const groupFiltered = grpTab === 'All'
    ? allFixtures
    : GF.filter((f) => f.group === grpTab);

  const statusFiltered = groupFiltered.filter((f) => {
    const res = results[f.id];
    const hasScore = res?.homeGoals !== undefined;
    const status = res?.matchStatus;
    const isLive = status === 'IN_PLAY' || status === 'PAUSED';
    return matchFilter === 'finished' ? hasScore && !isLive : !hasScore || isLive;
  });

  const teamFiltered = teamFilter.trim()
    ? statusFiltered.filter((f) => {
        const q = teamFilter.toLowerCase();
        return f.home.toLowerCase().includes(q) || f.away.toLowerCase().includes(q);
      })
    : statusFiltered;

  const filteredFixtures = [...teamFiltered].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return matchFilter === 'finished' ? -diff : diff;
  });

  return (
    <div>
      {/* Group filter pills */}
      <div className="pills-row" style={{ marginBottom: 12 }}>
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

      {/* Upcoming / Finished toggle */}
      <MatchFilterToggle value={matchFilter} onChange={setMatchFilter} style={{ marginBottom: 20 }} />

      {/* Team filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Filter by team..."
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          style={{
            background: '#0f172a',
            border: '1.5px solid #1e293b',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 13,
            padding: '8px 14px',
            outline: 'none',
            width: '100%',
            maxWidth: 280,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div className="fixtures-cols">
        {/* Match list */}
        <div>
          {filteredFixtures.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
          {filteredFixtures.length === 0 && (
            <div style={{ color: '#475569', textAlign: 'center', padding: 40, fontSize: 14 }}>
              No {matchFilter} matches{grpTab !== 'All' ? ` in Group ${grpTab}` : ''}
              {teamFilter.trim() ? ` matching "${teamFilter.trim()}"` : ''}
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
