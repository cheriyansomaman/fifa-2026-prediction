import type { Tab } from '../types';
import { useAppStore } from '../store/useAppStore';

interface TabConfig {
  id: Tab;
  label: string;
  adminOnly?: boolean;
}

const TABS: TabConfig[] = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'groups', label: 'Groups' },
  { id: 'knockout', label: 'Knockout' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'results', label: 'Results', adminOnly: true },
  { id: 'users', label: 'Users', adminOnly: true },
];

export function Nav() {
  const { tab, setTab, isAdmin } = useAppStore();
  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 68,
        zIndex: 90,
        background: '#131728',
        borderBottom: '1px solid #1C2340',
      }}
    >
      <div className="nav-inner" style={{ padding: '0 20px' }}>
        {visibleTabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00C460' : '2px solid transparent',
                color: isActive ? '#3DFFA3' : '#64748b',
                padding: '14px 16px',
                fontSize: 12,
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontFamily: "'Barlow Condensed', sans-serif",
                transition: 'color 150ms, border-color 150ms',
                whiteSpace: 'nowrap',
                minHeight: 'unset',
              }}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
