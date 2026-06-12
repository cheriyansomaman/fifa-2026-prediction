import type { Fixture, Prediction, Result, TeamStanding } from '../types';
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

export function buildKO(results: Record<number, Result>): Fixture[] {
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

  const gw = groupWinners;
  const gr = groupRunners;

  const r32: Fixture[] = [
    { id: 101, home: gw.A, away: t(4), date: '2026-06-29T20:00:00Z', stage: 'r32', label: 'R32 #1', venue: 'Mexico City' },
    { id: 102, home: gw.C, away: gr.F, date: '2026-06-29T17:00:00Z', stage: 'r32', label: 'R32 #2', venue: 'Houston' },
    { id: 103, home: gw.F, away: gr.C, date: '2026-06-29T01:00:00Z', stage: 'r32', label: 'R32 #3', venue: 'Guadalajara' },
    { id: 104, home: gw.E, away: t(0), date: '2026-06-29T21:30:00Z', stage: 'r32', label: 'R32 #4', venue: 'Boston' },
    { id: 105, home: gr.E, away: gr.I, date: '2026-06-30T17:00:00Z', stage: 'r32', label: 'R32 #5', venue: 'Dallas' },
    { id: 106, home: gw.I, away: t(1), date: '2026-06-30T21:00:00Z', stage: 'r32', label: 'R32 #6', venue: 'New York/NJ' },
    { id: 107, home: gw.L, away: t(2), date: '2026-07-01T16:00:00Z', stage: 'r32', label: 'R32 #7', venue: 'Atlanta' },
    { id: 108, home: gw.G, away: t(3), date: '2026-07-01T20:00:00Z', stage: 'r32', label: 'R32 #8', venue: 'Seattle' },
    { id: 109, home: gw.D, away: t(5), date: '2026-07-02T01:00:00Z', stage: 'r32', label: 'R32 #9', venue: 'San Francisco' },
    { id: 110, home: gw.B, away: t(7), date: '2026-07-02T19:00:00Z', stage: 'r32', label: 'R32 #10', venue: 'Kansas City' },
    { id: 111, home: gw.J, away: gr.H, date: '2026-07-03T01:00:00Z', stage: 'r32', label: 'R32 #11', venue: 'Miami' },
    { id: 112, home: gw.K, away: t(6), date: '2026-07-03T01:30:00Z', stage: 'r32', label: 'R32 #12', venue: 'Dallas' },
    { id: 113, home: gw.H, away: gr.J, date: '2026-07-02T01:00:00Z', stage: 'r32', label: 'R32 #13', venue: 'Los Angeles' },
    { id: 114, home: gr.D, away: gr.G, date: '2026-07-02T17:00:00Z', stage: 'r32', label: 'R32 #14', venue: 'Philadelphia' },
    { id: 115, home: gr.A, away: gr.B, date: '2026-07-01T20:00:00Z', stage: 'r32', label: 'R32 #15', venue: 'Toronto' },
    { id: 116, home: gr.L, away: gr.K, date: '2026-07-03T17:00:00Z', stage: 'r32', label: 'R32 #16', venue: 'Vancouver' },
  ];
  allKO.push(...r32);

  const r16: Fixture[] = [
    { id: 201, home: winner(101), away: winner(102), date: '2026-07-05T17:00:00Z', stage: 'r16', label: 'R16 #1', venue: 'Dallas' },
    { id: 202, home: winner(103), away: winner(104), date: '2026-07-05T21:00:00Z', stage: 'r16', label: 'R16 #2', venue: 'New York/NJ' },
    { id: 203, home: winner(105), away: winner(106), date: '2026-07-06T17:00:00Z', stage: 'r16', label: 'R16 #3', venue: 'Los Angeles' },
    { id: 204, home: winner(107), away: winner(108), date: '2026-07-06T21:00:00Z', stage: 'r16', label: 'R16 #4', venue: 'Atlanta' },
    { id: 205, home: winner(109), away: winner(110), date: '2026-07-07T17:00:00Z', stage: 'r16', label: 'R16 #5', venue: 'Houston' },
    { id: 206, home: winner(111), away: winner(112), date: '2026-07-07T21:00:00Z', stage: 'r16', label: 'R16 #6', venue: 'Seattle' },
    { id: 207, home: winner(113), away: winner(114), date: '2026-07-08T17:00:00Z', stage: 'r16', label: 'R16 #7', venue: 'Miami' },
    { id: 208, home: winner(115), away: winner(116), date: '2026-07-08T21:00:00Z', stage: 'r16', label: 'R16 #8', venue: 'Vancouver' },
  ];
  allKO.push(...r16);

  const qf: Fixture[] = [
    { id: 301, home: winner(201), away: winner(202), date: '2026-07-11T19:00:00Z', stage: 'qf', label: 'QF #1', venue: 'Kansas City' },
    { id: 302, home: winner(203), away: winner(204), date: '2026-07-11T23:00:00Z', stage: 'qf', label: 'QF #2', venue: 'Dallas' },
    { id: 303, home: winner(205), away: winner(206), date: '2026-07-12T19:00:00Z', stage: 'qf', label: 'QF #3', venue: 'Los Angeles' },
    { id: 304, home: winner(207), away: winner(208), date: '2026-07-12T23:00:00Z', stage: 'qf', label: 'QF #4', venue: 'Boston' },
  ];
  allKO.push(...qf);

  const sf: Fixture[] = [
    { id: 401, home: winner(301), away: winner(302), date: '2026-07-15T23:00:00Z', stage: 'sf', label: 'SF #1', venue: 'Atlanta' },
    { id: 402, home: winner(303), away: winner(304), date: '2026-07-16T23:00:00Z', stage: 'sf', label: 'SF #2', venue: 'New York/NJ' },
  ];
  allKO.push(...sf);

  const fin: Fixture[] = [
    { id: 501, home: winner(401), away: winner(402), date: '2026-07-19T23:00:00Z', stage: 'final', label: 'Final', venue: 'New York/NJ' },
  ];

  return [...r32, ...r16, ...qf, ...sf, ...fin];
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
