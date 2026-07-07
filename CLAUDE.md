# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b && vite build → dist/
npm run preview   # preview production build locally
npm test          # vitest run — frontend (src/data/__tests__) + backend (backend/src/__tests__)
```

Run a single test file: `npx vitest run backend/src/__tests__/fixtureMapper.test.ts`
Filter by name: `npx vitest run -t 'penalty'`. Type-check only: `npx tsc -b`.

Backend (live score sync) has its own package:

```bash
cd backend && npm ci
npm run dev     # tsx watch src/index.ts
npm start       # single process, polls every 30s
```

## Environment Setup

Frontend — copy `.env.example` to `.env` and fill in Firebase values (`VITE_FIREBASE_*`), plus optional `VITE_ADMIN_WHATSAPP`. **Never put secrets behind the `VITE_` prefix** — Vite inlines those into the browser bundle. Telegram bot tokens etc. are server-side only.

Backend — copy `backend/.env.example` to `backend/.env`: `FOOTBALL_DATA_TOKEN` (football-data.org API) and either `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON) or `FIREBASE_SERVICE_ACCOUNT_KEY` (inline JSON, used by CI/Fly).

Service worker (`public/sw.js`) only registers in production builds — dev runs without SW caching.

## Architecture

Two deployables sharing one repo:

1. **Frontend SPA** — React 18 + TypeScript + Vite, Zustand for state, Firebase Firestore for persistence. Deployed on Netlify (`netlify.toml` handles SPA redirects and security headers).
2. **`backend/` live score sync** — Node service (tsx + firebase-admin) that polls football-data.org v4 every 30s and writes live/finished scores into `app/results`. Deployed on Fly.io (`backend/fly.toml`, root `Dockerfile`), or run ad-hoc via the manual GitHub Actions workflow `.github/workflows/live-sync.yml` (`workflow_dispatch`, self-terminates via `MAX_RUN_SECONDS`).

**Cross-cutting dependency:** the backend imports frontend source directly (`src/data/constants.ts`, `src/data/logic.ts`, `src/types.ts` via `../../src/`). The root `Dockerfile` copies `src/` into the image for this reason. Changes to those files must keep the backend compiling.

Root `main.js` and root `styles.css` are the **legacy vanilla-JS implementation** — unreferenced; the entry point is `index.html` → `src/main.tsx`. Don't edit them.

### Data Flow (frontend)

All app state lives in a single Zustand store (`src/store/useAppStore.ts`). Firebase sync is split into two hooks mounted in `App.tsx`:

- **`useFirebaseSync`** — always-on listeners (when logged in) for `app/results`, `predictions/{uid}` (own predictions), and `users/{uid}` (live role/displayName). Sets `loading: false` after first results snapshot.
- **`useLazySync`** — tab-triggered listeners. Subscribes to `users` on leaderboard/users tabs; to all `predictions` on leaderboard; to `passwordRequests` on users tab. Subscriptions are one-way (never unsubscribed once active per session, except on logout). `refreshLeaderboard` in the store does an additional one-shot `getDocs` pull of all predictions.

### Firestore Schema

| Collection/Doc | Contents |
|---|---|
| `users/{uid}` | `name`, `displayName?`, `hashed` (bcrypt), `tempHashed?`, `role?`, `whatsapp?`, `countryCode?`, `created` |
| `app/results` | `{[fixtureId]: Result}` — single merged doc, written by admins *and* the backend sync |
| `predictions/{uid}` | `{[fixtureId]: Prediction}` — one doc per user |
| `passwordRequests/{uid}` | `PasswordRequest` — cleared on temp pw generation or dismissal |

Auth is custom: bcrypt on client, no Firebase Auth. `uid` is derived from the lowercased username. First login with an unknown name registers the account (requires WhatsApp number). Sessions stored in `localStorage` with 15-day expiry (`fifa_session` key).

### Backend Sync Pipeline (`backend/src/`)

`index.ts` tick loop → `apiClient.ts` fetches LIVE + recently-FINISHED matches → `fixtureMapper.ts` resolves each API match to a fixture id (team names normalized through `teamMapping.ts` aliases; index built from `GF` plus `buildKO(results)`; KO fixtures are indexed in both home/away orders because our bracket slotting doesn't always match the API's designation) → `resultTransformer.ts#toResult` converts to the app's `Result` shape → merge-write to `app/results`.

Gotchas encoded here: football-data.org's `fullTime` score is inflated by penalty goals during shootouts (use `regularTime`, or subtract penalties); finished fixtures are skipped for the rest of the process lifetime via in-memory `finalizedIds`; unchanged results are deduped via `lastKnownResults`.

### Knockout Bracket Generation

`buildKO(results)` in `src/data/logic.ts` returns the full KO fixture list. The R32 pairings are **hardcoded with the actual qualified teams** (ids 101–116); R16 → Final teams are derived by reading each feeder match's result (`winner()` resolves score, then penalty score, then `penaltyWinner`). The store recomputes `ko` from scratch on every `setResults`.

### Scoring Logic

`calcPts(pred, res, fixture)` in `src/data/logic.ts` returns points directly:

- **Group stage:** exact score 5 · correct winner + GD 4 · correct winner or correct draw 3 · predicted a winner but actual was a draw 1 · otherwise 0.
- **KO, decisive in 90'/ET:** exact 5 · winner + GD 4 · winner 3 · otherwise 0.
- **KO, went to penalties:** predicted the draw → 4 if exact score else 3, plus **+1** for correct penalty winner; predicted a winner → 4 if that team won the shootout, else 1.

Predictions are open until kickoff (`predOpen`); others' predictions become viewable 1h before kickoff (`predViewable`).

### Admin vs User Roles

`isAdmin` comes from `users/{uid}.role === 'admin'` (set directly in Firestore, synced live). Admins see **Results** and **Users** tabs. Admin operations: enter official results (`enterResult`), generate temp passwords (`generateTempForUser` — a temp pw forces a password change on next login), dismiss password requests (`dismissPwRequest`).

### Tournament Data

Group fixtures and team definitions are static in `src/data/constants.ts` (`GF` array — 72 group fixtures, `GROUPS` map, `FLAGS` map). R32 pairings live in `buildKO` in `src/data/logic.ts`. API team-name aliases live in `backend/src/teamMapping.ts` — a new API spelling that doesn't match our names shows up as `UNMATCHED` in sync logs and needs an alias there.

### Modal System

`useAppStore.modal` is `null | { type: 'predict', fixture } | { type: 'result', fixture } | { type: 'rules' }`. `App.tsx` renders the correct modal component based on type.
