import './styles.css';
import { useAppStore } from './store/useAppStore';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useLazySync } from './hooks/useLazySync';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { PredictModal } from './components/modals/PredictModal';
import { ResultModal } from './components/modals/ResultModal';
import { EditTeamModal } from './components/modals/EditTeamModal';
import { RulesModal } from './components/modals/RulesModal';
import { LoginPage } from './pages/LoginPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { FixturesTab } from './pages/FixturesTab';
import { GroupsTab } from './pages/GroupsTab';
import { KnockoutTab } from './pages/KnockoutTab';
import { LeaderboardTab } from './pages/LeaderboardTab';
import { ResultsTab } from './pages/ResultsTab';
import { UsersTab } from './pages/UsersTab';

function TabContent() {
  const { tab } = useAppStore();

  switch (tab) {
    case 'fixtures':    return <FixturesTab />;
    case 'groups':      return <GroupsTab />;
    case 'knockout':    return <KnockoutTab />;
    case 'leaderboard': return <LeaderboardTab />;
    case 'results':     return <ResultsTab />;
    case 'users':       return <UsersTab />;
    default:            return <FixturesTab />;
  }
}

function Modals() {
  const { modal } = useAppStore();
  if (!modal) return null;

  if (modal.type === 'predict')  return <PredictModal />;
  if (modal.type === 'result')   return <ResultModal />;
  if (modal.type === 'editTeam') return <EditTeamModal />;
  if (modal.type === 'rules')    return <RulesModal />;
  return null;
}

export default function App() {
  useFirebaseSync();
  useLazySync();

  const { loading, uid, mustChangePassword, msg, errorMsg, syncError } = useAppStore();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#131728',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="spin"
            style={{ fontSize: 40, marginBottom: 16 }}
          >
            ⚽
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (!uid) {
    return (
      <div style={{ background: '#131728', minHeight: '100vh' }}>
        <LoginPage />
      </div>
    );
  }

  if (mustChangePassword) {
    return (
      <div style={{ background: '#131728', minHeight: '100vh' }}>
        <ChangePasswordPage />
      </div>
    );
  }

  return (
    <div style={{ background: '#131728', minHeight: '100vh' }}>
      <Header />
      <Nav />

      {msg && (
        <div
          className="toast-msg"
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: '#052e16',
            border: '1.5px solid #16a34a',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#4ade80',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {msg}
        </div>
      )}

      {errorMsg && (
        <div
          className="toast-msg"
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: '#450a0a',
            border: '1.5px solid #b91c1c',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#f87171',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {errorMsg}
        </div>
      )}

      {syncError && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: '#422006',
            border: '1.5px solid #92400e',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 600,
            color: '#fbbf24',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: '90vw',
          }}
        >
          <span>{syncError}</span>
          <button
            onClick={() => useAppStore.setState({ syncError: '' })}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fbbf24',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
            type="button"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <main className="main-wrap">
        <TabContent />
      </main>

      <Modals />
    </div>
  );
}
