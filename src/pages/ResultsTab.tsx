import { useState } from 'react';
import type { Fixture, MatchStatus, Result } from '../types';
import { useAppStore } from '../store/useAppStore';
import { GF } from '../data/constants';
import { fmtDate, predOpen } from '../data/logic';
import { Stepper } from '../components/Stepper';
import { FlagImg } from '../components/FlagImg';
import { MatchFilterToggle } from '../components/shared';
import type { MatchFilter } from '../components/shared';

interface MatchScoreState {
  hg: number;
  ag: number;
  homePen: number;
  awayPen: number;
  status: MatchStatus;
}

const STATUS_TAGS: { label: string; value: MatchStatus; color: string }[] = [
  { label: 'Scheduled', value: 'SCHEDULED', color: '#64748b' },
  { label: 'Live', value: 'IN_PLAY', color: '#f97316' },
  { label: 'Finished', value: 'FINISHED', color: '#3DFFA3' },
];

function effectiveStatus(fixture: Fixture, existing: Result): MatchStatus {
  return existing.matchStatus ?? (predOpen(fixture.date) ? 'SCHEDULED' : 'FINISHED');
}

function isLiveStatus(s: MatchStatus): boolean {
  return s === 'IN_PLAY' || s === 'PAUSED';
}

function isFinishedStatus(s: MatchStatus): boolean {
  return s === 'FINISHED' || s === 'AWARDED';
}

export function ResultsTab() {
  const { results, ko, enterResult, saving } = useAppStore();

  const [localScores, setLocalScores] = useState<Record<number, MatchScoreState>>({});
  const [tab, setTab] = useState<MatchFilter>('upcoming');

  const getScore = (fixture: Fixture, existing: Result): MatchScoreState => {
    if (localScores[fixture.id]) return localScores[fixture.id];
    return {
      hg: existing.homeGoals ?? 0,
      ag: existing.awayGoals ?? 0,
      homePen: existing.homePenGoals ?? 0,
      awayPen: existing.awayPenGoals ?? 0,
      status: effectiveStatus(fixture, existing),
    };
  };

  const updateScore = <K extends keyof MatchScoreState>(fixture: Fixture, field: K, value: MatchScoreState[K]) => {
    setLocalScores((prev) => {
      const id = fixture.id;
      const existing = prev[id] ?? getScore(fixture, results[id] ?? {});
      return { ...prev, [id]: { ...existing, [field]: value } };
    });
  };

  const handleSave = (fixture: Fixture) => {
    const { id, home, away, stage } = fixture;
    const isKO = stage !== 'group';
    const score = localScores[id] ?? getScore(fixture, results[id] ?? {});
    const showPens = isKO && score.hg === score.ag;
    const result: Result = { homeGoals: score.hg, awayGoals: score.ag, matchStatus: score.status };
    if (showPens) {
      result.homePenGoals = score.homePen;
      result.awayPenGoals = score.awayPen;
      result.penaltyWinner = score.homePen > score.awayPen ? home : away;
    }
    enterResult(fixture, result);
  };

  const renderMatchRow = (fixture: Fixture) => {
    const existing = results[fixture.id] ?? {};
    const hasRes = existing.homeGoals !== undefined;
    const isKO = fixture.stage !== 'group';
    const score = getScore(fixture, existing);
    const showPens = isKO && score.hg === score.ag;

    return (
      <div
        key={fixture.id}
        style={{
          background: hasRes ? '#052e16' : '#0a1628',
          border: `1.5px solid ${hasRes ? '#16a34a55' : '#1e293b'}`,
          borderLeft: `3px solid ${hasRes ? '#16a34a' : '#334155'}`,
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 10,
        }}
      >
        {/* Date + match info */}
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          {fmtDate(fixture.date)} · {fixture.label ?? (fixture.group ? `Group ${fixture.group}` : fixture.stage.toUpperCase())}
        </div>

        {/* Status tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {STATUS_TAGS.map((tag) => {
            const isActive = score.status === tag.value;
            return (
              <button
                key={tag.label}
                onClick={() => updateScore(fixture, 'status', tag.value)}
                className="btn-sport"
                style={{
                  background: isActive ? `${tag.color}22` : '#0f172a',
                  border: `1.5px solid ${isActive ? tag.color : '#1e293b'}`,
                  color: isActive ? tag.color : '#64748b',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
                type="button"
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Main score row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 120px', minWidth: 100 }}>
            <FlagImg name={fixture.home} size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{fixture.home}</span>
          </div>

          {/* Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stepper
              initialValue={score.hg}
              accent="#f59e0b"
              onChange={(v) => updateScore(fixture, 'hg', v)}
              size="sm"
            />
            <span style={{ fontSize: 16, color: '#475569', fontWeight: 700 }}>&ndash;</span>
            <Stepper
              initialValue={score.ag}
              accent="#f59e0b"
              onChange={(v) => updateScore(fixture, 'ag', v)}
              size="sm"
            />
          </div>

          {/* Away */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 120px', minWidth: 100 }}>
            <FlagImg name={fixture.away} size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{fixture.away}</span>
          </div>

          {/* Save button */}
          <button
            onClick={() => handleSave(fixture)}
            disabled={saving}
            className="btn-sport btn-amber"
            style={{
              padding: '6px 16px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              letterSpacing: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
            type="button"
          >
            {hasRes ? 'Update' : 'Save'}
          </button>
        </div>

        {/* Penalty row (KO only, when draw) */}
        {isKO && showPens && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              Pens:
            </span>
            <Stepper
              label={fixture.home}
              initialValue={score.homePen}
              accent="#f59e0b"
              onChange={(v) => updateScore(fixture, 'homePen', v)}
              size="sm"
            />
            <span style={{ fontSize: 14, color: '#475569', fontWeight: 700 }}>&ndash;</span>
            <Stepper
              label={fixture.away}
              initialValue={score.awayPen}
              accent="#f59e0b"
              onChange={(v) => updateScore(fixture, 'awayPen', v)}
              size="sm"
            />
          </div>
        )}
      </div>
    );
  };

  const allFixtures = [...GF, ...ko];

  const filtered = allFixtures.filter((f) => {
    const status = effectiveStatus(f, results[f.id] ?? {});
    if (tab === 'live') return isLiveStatus(status);
    if (tab === 'finished') return isFinishedStatus(status);
    return !isLiveStatus(status) && !isFinishedStatus(status);
  });

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return tab === 'finished' ? -diff : diff;
  });

  return (
    <div>
      <MatchFilterToggle
        value={tab}
        onChange={setTab}
        filters={['upcoming', 'live', 'finished']}
        style={{ marginBottom: 20 }}
      />

      {sorted.map((f) => renderMatchRow(f))}

      {sorted.length === 0 && (
        <div style={{ color: '#475569', textAlign: 'center', padding: 40, fontSize: 14 }}>
          No {tab} matches
        </div>
      )}
    </div>
  );
}
