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
  const thirds: Array<{ team: string; group: string; pts: number; gd: number; gf: number }> = [];

  Object.keys(GROUPS).forEach((g) => {
    const groupMatches = GF.filter((f) => f.group === g);
    const allPlayed = groupMatches.every((f) => results[f.id]);

    if (allPlayed) {
      const s = standings(g, results);
      groupWinners[g] = s[0]?.name ?? 'TBC';
      groupRunners[g] = s[1]?.name ?? 'TBC';
      if (s[2]) {
        thirds.push({ team: s[2].name, group: g, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf });
      }
    } else {
      groupWinners[g] = 'TBC';
      groupRunners[g] = 'TBC';
    }
  });

  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  // FIFA's official eligibility table: each round-of-32 slot needing a
  // best-third-place team only accepts thirds from these 5 groups.
  // Slots are filled in match-number order (73, 75, 78, 80, 81, 82, 85, 87),
  // each taking the best-ranked remaining eligible third.
  const THIRD_PLACE_ELIGIBILITY: Record<string, string[]> = {
    A: ['C', 'E', 'F', 'H', 'I'],
    E: ['A', 'B', 'C', 'D', 'F'],
    I: ['C', 'D', 'F', 'G', 'H'],
    L: ['E', 'H', 'I', 'J', 'K'],
    D: ['B', 'E', 'F', 'I', 'J'],
    G: ['A', 'E', 'H', 'I', 'J'],
    B: ['E', 'F', 'G', 'I', 'J'],
    K: ['D', 'E', 'I', 'J', 'L'],
  };
  const THIRD_PLACE_ORDER = ['A', 'E', 'I', 'L', 'D', 'G', 'B', 'K'];

  // A pure first-fit greedy can leave a valid combination unassignable (e.g. the
  // best-ranked eligible third for a slot is also the only option for another
  // slot), so assignment uses augmenting paths (Kuhn's algorithm) to guarantee
  // every qualifying third lands in some eligible slot whenever one exists.
  const pool = thirds.slice(0, 8).map((th) => th.group);
  const slotForGroup: Record<string, string> = {};
  const tryAssign = (slot: string, visited: Set<string>): boolean => {
    for (const g of pool) {
      if (!THIRD_PLACE_ELIGIBILITY[slot].includes(g) || visited.has(g)) continue;
      visited.add(g);
      if (!(g in slotForGroup) || tryAssign(slotForGroup[g], visited)) {
        slotForGroup[g] = slot;
        return true;
      }
    }
    return false;
  };
  THIRD_PLACE_ORDER.forEach((slot) => tryAssign(slot, new Set()));

  const thirdPlace: Record<string, string> = {};
  THIRD_PLACE_ORDER.forEach((slot) => {
    const group = Object.keys(slotForGroup).find((g) => slotForGroup[g] === slot);
    thirdPlace[slot] = group ? thirds.find((th) => th.group === group)!.team : 'TBC';
  });

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
    { id: 101, home: gw.A, away: thirdPlace.A, date: '2026-07-01T01:00:00Z', stage: 'r32', label: 'R32 #1', venue: 'Mexico City' },
    { id: 102, home: gw.C, away: gr.F, date: '2026-06-29T17:00:00Z', stage: 'r32', label: 'R32 #2', venue: 'Houston' },
    { id: 103, home: gw.F, away: gr.C, date: '2026-06-30T01:00:00Z', stage: 'r32', label: 'R32 #3', venue: 'Guadalupe' },
    { id: 104, home: gw.E, away: thirdPlace.E, date: '2026-06-29T20:30:00Z', stage: 'r32', label: 'R32 #4', venue: 'Foxborough' },
    { id: 105, home: gr.E, away: gr.I, date: '2026-06-30T17:00:00Z', stage: 'r32', label: 'R32 #5', venue: 'Arlington' },
    { id: 106, home: gw.I, away: thirdPlace.I, date: '2026-06-30T21:00:00Z', stage: 'r32', label: 'R32 #6', venue: 'East Rutherford' },
    { id: 107, home: gw.L, away: thirdPlace.L, date: '2026-07-01T16:00:00Z', stage: 'r32', label: 'R32 #7', venue: 'Atlanta' },
    { id: 108, home: gw.G, away: thirdPlace.G, date: '2026-07-01T20:00:00Z', stage: 'r32', label: 'R32 #8', venue: 'Seattle' },
    { id: 109, home: gw.D, away: thirdPlace.D, date: '2026-07-02T00:00:00Z', stage: 'r32', label: 'R32 #9', venue: 'Santa Clara' },
    { id: 110, home: gw.B, away: thirdPlace.B, date: '2026-07-03T03:00:00Z', stage: 'r32', label: 'R32 #10', venue: 'Vancouver' },
    { id: 111, home: gw.J, away: gr.H, date: '2026-07-03T22:00:00Z', stage: 'r32', label: 'R32 #11', venue: 'Miami Gardens' },
    { id: 112, home: gw.K, away: thirdPlace.K, date: '2026-07-04T01:30:00Z', stage: 'r32', label: 'R32 #12', venue: 'Kansas City' },
    { id: 113, home: gw.H, away: gr.J, date: '2026-07-02T19:00:00Z', stage: 'r32', label: 'R32 #13', venue: 'Inglewood' },
    { id: 114, home: gr.D, away: gr.G, date: '2026-07-03T18:00:00Z', stage: 'r32', label: 'R32 #14', venue: 'Arlington' },
    { id: 115, home: gr.A, away: gr.B, date: '2026-06-28T19:00:00Z', stage: 'r32', label: 'R32 #15', venue: 'Inglewood' },
    { id: 116, home: gr.K, away: gr.L, date: '2026-07-02T23:00:00Z', stage: 'r32', label: 'R32 #16', venue: 'Toronto' },
  ];
  allKO.push(...r32);

  const r16: Fixture[] = [
    { id: 201, home: winner(101), away: winner(102), date: '2026-07-04T21:00:00Z', stage: 'r16', label: 'R16 #1', venue: 'Philadelphia' },
    { id: 202, home: winner(103), away: winner(104), date: '2026-07-04T17:00:00Z', stage: 'r16', label: 'R16 #2', venue: 'Houston' },
    { id: 203, home: winner(105), away: winner(106), date: '2026-07-05T20:00:00Z', stage: 'r16', label: 'R16 #3', venue: 'East Rutherford' },
    { id: 204, home: winner(107), away: winner(108), date: '2026-07-06T00:00:00Z', stage: 'r16', label: 'R16 #4', venue: 'Mexico City' },
    { id: 205, home: winner(109), away: winner(110), date: '2026-07-06T19:00:00Z', stage: 'r16', label: 'R16 #5', venue: 'Arlington' },
    { id: 206, home: winner(111), away: winner(112), date: '2026-07-07T00:00:00Z', stage: 'r16', label: 'R16 #6', venue: 'Seattle' },
    { id: 207, home: winner(113), away: winner(114), date: '2026-07-07T16:00:00Z', stage: 'r16', label: 'R16 #7', venue: 'Atlanta' },
    { id: 208, home: winner(115), away: winner(116), date: '2026-07-07T20:00:00Z', stage: 'r16', label: 'R16 #8', venue: 'Vancouver' },
  ];
  allKO.push(...r16);

  const qf: Fixture[] = [
    { id: 301, home: winner(201), away: winner(202), date: '2026-07-09T20:00:00Z', stage: 'qf', label: 'QF #1', venue: 'Foxborough' },
    { id: 302, home: winner(203), away: winner(204), date: '2026-07-10T19:00:00Z', stage: 'qf', label: 'QF #2', venue: 'Inglewood' },
    { id: 303, home: winner(205), away: winner(206), date: '2026-07-11T21:00:00Z', stage: 'qf', label: 'QF #3', venue: 'Miami Gardens' },
    { id: 304, home: winner(207), away: winner(208), date: '2026-07-12T01:00:00Z', stage: 'qf', label: 'QF #4', venue: 'Kansas City' },
  ];
  allKO.push(...qf);

  const sf: Fixture[] = [
    { id: 401, home: winner(301), away: winner(302), date: '2026-07-14T19:00:00Z', stage: 'sf', label: 'SF #1', venue: 'Arlington' },
    { id: 402, home: winner(303), away: winner(304), date: '2026-07-15T19:00:00Z', stage: 'sf', label: 'SF #2', venue: 'Atlanta' },
  ];
  allKO.push(...sf);

  const fin: Fixture[] = [
    { id: 501, home: winner(401), away: winner(402), date: '2026-07-19T19:00:00Z', stage: 'final', label: 'Final', venue: 'East Rutherford' },
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
