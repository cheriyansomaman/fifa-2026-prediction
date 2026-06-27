import type { Fixture, KoTeamOverride, Prediction, Result, TeamStanding } from '../types';
import { FLAGS, GROUPS, GF } from './constants';

export function flag(name: string): string {
  return FLAGS[name] ?? '⚽';
}

export function predOpen(kickoff: string): boolean {
  return Date.now() < new Date(kickoff).getTime();
}

export function predViewable(kickoff: string): boolean {
  return Date.now() >= new Date(kickoff).getTime() - 3_600_000;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function standings(
  group: string,
  results: Record<number, Result>,
): TeamStanding[] {
  const teams: TeamStanding[] = (GROUPS[group] ?? []).map((name) => ({
    name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
  }));

  const teamMap = Object.fromEntries(teams.map((t) => [t.name, t]));

  GF.filter((f) => f.group === group).forEach((f) => {
    const r = results[f.id];
    if (!r) return;

    const home = teamMap[f.home];
    const away = teamMap[f.away];
    if (!home || !away) return;

    const hg = Number(r.homeGoals);
    const ag = Number(r.awayGoals);
    if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;

    home.p++;
    away.p++;
    home.gf += hg;
    home.ga += ag;
    home.gd += hg - ag;
    away.gf += ag;
    away.ga += hg;
    away.gd += ag - hg;

    if (hg > ag) {
      home.w++;
      home.pts += 3;
      away.l++;
    } else if (hg < ag) {
      away.w++;
      away.pts += 3;
      home.l++;
    } else {
      home.d++;
      home.pts++;
      away.d++;
      away.pts++;
    }
  });

  return [...teams].sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf,
  );
}

export function qualifyingThirds(results: Record<number, Result>): Set<string> {
  const thirds = Object.keys(GROUPS)
    .map((g) => standings(g, results)[2])
    .filter((t): t is TeamStanding => t !== undefined);

  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  return new Set(thirds.slice(0, 8).map((t) => t.name));
}

export function buildKO(
  results: Record<number, Result>,
  overrides: Record<number, KoTeamOverride> = {},
): Fixture[] {
  // Admin-set overrides win over both live formulas and hardcoded literals — applied
  // per-round before later rounds resolve via winner()/loser(), so the fix propagates forward.
  const withOverrides = (fixtures: Fixture[]): Fixture[] =>
    fixtures.map((f) => {
      const o = overrides[f.id];
      if (!o) return f;
      return { ...f, home: o.home ?? f.home, away: o.away ?? f.away };
    });

  const groupWinners: Record<string, string> = {};
  const groupRunners: Record<string, string> = {};
  const thirds: Array<{ team: string; pts: number; gd: number; gf: number }> = [];

  Object.keys(GROUPS).forEach((g) => {
    const groupMatches = GF.filter((f) => f.group === g);
    const allPlayed = groupMatches.every((f) => results[f.id]);

    if (allPlayed) {
      const s = standings(g, results);
      groupWinners[g] = s[0]?.name ?? 'TBC';
      groupRunners[g] = s[1]?.name ?? 'TBC';
      if (s[2]) {
        thirds.push({ team: s[2].name, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf });
      }
    } else {
      groupWinners[g] = 'TBC';
      groupRunners[g] = 'TBC';
    }
  });

  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  const t = (i: number): string => thirds[i]?.team ?? 'TBC';

  // allKO is built up progressively so winner() can reference earlier matches
  const allKO: Fixture[] = [];

  const winner = (id: number): string => {
    const r = results[id];
    if (!r) return 'TBC';

    const hg = Number(r.homeGoals);
    const ag = Number(r.awayGoals);

    if (!Number.isFinite(hg) || !Number.isFinite(ag)) {
      return r.winner ?? 'TBC';
    }

    const fix = allKO.find((f) => f.id === id);
    if (!fix) return 'TBC';

    if (hg > ag) return fix.home;
    if (ag > hg) return fix.away;

    if (r.homePenGoals != null && r.awayPenGoals != null) {
      return r.homePenGoals > r.awayPenGoals ? fix.home : fix.away;
    }

    return r.penaltyWinner ?? 'TBC';
  };

  // Loser of a knockout match — mirrors winner(), used for the 3rd-place play-off.
  const loser = (id: number): string => {
    const r = results[id];
    if (!r) return 'TBC';

    const hg = Number(r.homeGoals);
    const ag = Number(r.awayGoals);

    const fix = allKO.find((f) => f.id === id);
    if (!fix) return 'TBC';

    if (!Number.isFinite(hg) || !Number.isFinite(ag)) {
      if (!r.winner) return 'TBC';
      return r.winner === fix.home ? fix.away : fix.home;
    }

    if (hg > ag) return fix.away;
    if (ag > hg) return fix.home;

    if (r.homePenGoals != null && r.awayPenGoals != null) {
      return r.homePenGoals > r.awayPenGoals ? fix.away : fix.home;
    }

    if (!r.penaltyWinner) return 'TBC';
    return r.penaltyWinner === fix.home ? fix.away : fix.home;
  };

  const gw = groupWinners;
  const gr = groupRunners;

  // R32 dates below are best-effort, cross-referenced against FIFA's published schedule via
  // WebSearch (WebFetch to fifa.com is blocked in this environment). Venue + matchup-category
  // pairings (e.g. "winner vs runner-up at Inglewood") were corroborated across multiple
  // searches and are high-confidence; exact kickoff minutes carry lower confidence than the
  // dates/venues. QF, SF, and Final dates were independently verified as already correct.
  //
  // Team names: Groups A-I had already finished by the time this was written, so their
  // winner/runner-up is hardcoded as a literal country name (cross-checked via WebSearch,
  // Google results, and FIFA's site) rather than left as a live gw.X/gr.X lookup - this lets
  // the bracket show the real matchup immediately without requiring an admin to re-enter all
  // 72 already-finished group matches into this app. Groups J, K, and L play their final
  // matchday tonight (still TBD as of writing) and the top-8 third-place ranking can still
  // shift depending on those results, so every t(i) slot and every J/K/L group reference is
  // intentionally left as a live formula to resolve once an admin enters those results.
  const r32: Fixture[] = [
    { id: 101, home: 'Mexico', away: t(4), date: '2026-07-01T08:00:00Z', stage: 'r32', label: 'R32 #1', venue: 'Mexico City' },
    { id: 102, home: 'Brazil', away: 'Japan', date: '2026-06-29T23:00:00Z', stage: 'r32', label: 'R32 #2', venue: 'Houston' },
    { id: 103, home: 'Netherlands', away: 'Morocco', date: '2026-06-30T08:00:00Z', stage: 'r32', label: 'R32 #3', venue: 'Guadalupe' },
    { id: 104, home: 'Germany', away: t(0), date: '2026-06-30T01:30:00Z', stage: 'r32', label: 'R32 #4', venue: 'Foxborough' },
    { id: 105, home: 'Ivory Coast', away: 'Norway', date: '2026-06-30T23:00:00Z', stage: 'r32', label: 'R32 #5', venue: 'Arlington' },
    { id: 106, home: 'France', away: t(1), date: '2026-07-01T02:00:00Z', stage: 'r32', label: 'R32 #6', venue: 'East Rutherford' },
    { id: 107, home: gw.L, away: t(2), date: '2026-07-01T16:00:00Z', stage: 'r32', label: 'R32 #7', venue: 'Atlanta' },
    { id: 108, home: 'Belgium', away: t(3), date: '2026-07-01T20:00:00Z', stage: 'r32', label: 'R32 #8', venue: 'Seattle' },
    { id: 109, home: 'United States', away: t(5), date: '2026-07-03T03:00:00Z', stage: 'r32', label: 'R32 #9', venue: 'Santa Clara' },
    { id: 110, home: 'Switzerland', away: t(7), date: '2026-07-04T06:00:00Z', stage: 'r32', label: 'R32 #10', venue: 'Vancouver' },
    { id: 111, home: gw.J, away: 'Cape Verde', date: '2026-07-03T22:00:00Z', stage: 'r32', label: 'R32 #11', venue: 'Miami Gardens' },
    { id: 112, home: gw.K, away: t(6), date: '2026-07-04T02:30:00Z', stage: 'r32', label: 'R32 #12', venue: 'Kansas City' },
    { id: 113, home: 'Spain', away: gr.J, date: '2026-07-03T22:00:00Z', stage: 'r32', label: 'R32 #13', venue: 'Inglewood' },
    { id: 114, home: 'Australia', away: 'Egypt', date: '2026-07-03T19:00:00Z', stage: 'r32', label: 'R32 #14', venue: 'Arlington' },
    { id: 115, home: 'South Africa', away: 'Canada', date: '2026-06-29T03:00:00Z', stage: 'r32', label: 'R32 #15', venue: 'Inglewood' },
    { id: 116, home: gr.L, away: gr.K, date: '2026-07-03T23:00:00Z', stage: 'r32', label: 'R32 #16', venue: 'Toronto' },
  ];
  allKO.push(...withOverrides(r32));

  // R16/QF pairings cross-wire R32/R16 winners per FIFA's official bracket (Match 89-96 for
  // R16, Match 97-100 for QF) — verified by venue via WebSearch, NOT simple sequential
  // adjacent pairing. e.g. M89 (Philadelphia) is Winner-M74 v Winner-M77, i.e. winner(102)
  // v winner(105) in our id scheme (100+n = FIFA match 72+n), not winner(101) v winner(102).
  const r16: Fixture[] = [
    { id: 201, home: winner(102), away: winner(105), date: '2026-07-04T21:00:00Z', stage: 'r16', label: 'R16 #1', venue: 'Philadelphia' },
    { id: 202, home: winner(101), away: winner(103), date: '2026-07-04T17:00:00Z', stage: 'r16', label: 'R16 #2', venue: 'Houston' },
    { id: 203, home: winner(104), away: winner(106), date: '2026-07-05T20:00:00Z', stage: 'r16', label: 'R16 #3', venue: 'East Rutherford' },
    { id: 204, home: winner(107), away: winner(108), date: '2026-07-06T00:00:00Z', stage: 'r16', label: 'R16 #4', venue: 'Mexico City' },
    { id: 205, home: winner(111), away: winner(112), date: '2026-07-06T19:00:00Z', stage: 'r16', label: 'R16 #5', venue: 'Arlington' },
    { id: 206, home: winner(109), away: winner(110), date: '2026-07-07T00:00:00Z', stage: 'r16', label: 'R16 #6', venue: 'Seattle' },
    { id: 207, home: winner(114), away: winner(116), date: '2026-07-07T16:00:00Z', stage: 'r16', label: 'R16 #7', venue: 'Atlanta' },
    { id: 208, home: winner(113), away: winner(115), date: '2026-07-07T20:00:00Z', stage: 'r16', label: 'R16 #8', venue: 'Vancouver' },
  ];
  allKO.push(...withOverrides(r16));

  const qf: Fixture[] = [
    { id: 301, home: winner(201), away: winner(202), date: '2026-07-09T20:00:00Z', stage: 'qf', label: 'QF #1', venue: 'Foxborough' },
    { id: 302, home: winner(205), away: winner(206), date: '2026-07-10T19:00:00Z', stage: 'qf', label: 'QF #2', venue: 'Inglewood' },
    { id: 303, home: winner(203), away: winner(204), date: '2026-07-11T21:00:00Z', stage: 'qf', label: 'QF #3', venue: 'Miami Gardens' },
    { id: 304, home: winner(207), away: winner(208), date: '2026-07-12T01:00:00Z', stage: 'qf', label: 'QF #4', venue: 'Kansas City' },
  ];
  allKO.push(...withOverrides(qf));

  const sf: Fixture[] = [
    { id: 401, home: winner(301), away: winner(302), date: '2026-07-14T19:00:00Z', stage: 'sf', label: 'SF #1', venue: 'Arlington' },
    { id: 402, home: winner(303), away: winner(304), date: '2026-07-15T19:00:00Z', stage: 'sf', label: 'SF #2', venue: 'Atlanta' },
  ];
  allKO.push(...withOverrides(sf));

  const third: Fixture[] = [
    { id: 450, home: loser(401), away: loser(402), date: '2026-07-18T21:00:00Z', stage: 'third', label: '3rd Place Play-off', venue: 'Miami Gardens' },
  ];
  allKO.push(...withOverrides(third));

  const fin: Fixture[] = [
    { id: 501, home: winner(401), away: winner(402), date: '2026-07-19T19:00:00Z', stage: 'final', label: 'Final', venue: 'East Rutherford' },
  ];
  allKO.push(...withOverrides(fin));

  return allKO;
}

export function calcPts(
  pred: Prediction,
  res: Result,
  fixture: Fixture,
): number {
  const hg = Number(res.homeGoals);
  const ag = Number(res.awayGoals);
  const phg = Number(pred.homeGoals);
  const pag = Number(pred.awayGoals);

  if (
    !Number.isFinite(hg) ||
    !Number.isFinite(ag) ||
    !Number.isFinite(phg) ||
    !Number.isFinite(pag)
  ) {
    return 0;
  }

  type Outcome = 'H' | 'A' | 'D';
  const actualOutcome: Outcome = hg > ag ? 'H' : ag > hg ? 'A' : 'D';
  const predOutcome: Outcome = phg > pag ? 'H' : pag > phg ? 'A' : 'D';

  if (fixture.stage === 'group') {
    if (phg === hg && pag === ag) return 5;
    if (actualOutcome === predOutcome) {
      if (actualOutcome === 'D') return 3;
      return hg - ag === phg - pag ? 4 : 3;
    }
    return actualOutcome === 'D' ? 1 : 0;
  }

  // Knockout stage
  if (actualOutcome !== 'D') {
    if (phg === hg && pag === ag) return 5;
    if (actualOutcome === predOutcome) {
      return hg - ag === phg - pag ? 4 : 3;
    }
    return 0;
  }

  // Actual result was a draw — went to penalties
  const penWinner: string | null =
    res.homePenGoals != null && res.awayPenGoals != null
      ? res.homePenGoals > res.awayPenGoals
        ? fixture.home
        : fixture.away
      : res.penaltyWinner ?? null;

  if (predOutcome === 'D') {
    let pts = phg === hg && pag === ag ? 4 : 3;
    const predPenWinner: string | null =
      pred.homePenGoals != null && pred.awayPenGoals != null
        ? pred.homePenGoals > pred.awayPenGoals
          ? fixture.home
          : fixture.away
        : pred.penaltyWinner ?? null;
    if (penWinner && predPenWinner === penWinner) pts += 1;
    return pts;
  }

  const predWinner = predOutcome === 'H' ? fixture.home : fixture.away;
  return penWinner === predWinner ? 4 : 1;
}
