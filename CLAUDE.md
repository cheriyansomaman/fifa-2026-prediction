# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b && vite build → dist/
npm run preview   # preview production build locally
```

No test suite exists. Type-check only: `npx tsc --noEmit`.

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TELEGRAM_BOT_TOKEN=      # optional — admin notifications
VITE_TELEGRAM_ADMIN_CHAT_ID=  # optional — admin notifications
```

Service worker only registers in production builds — dev runs without SW caching.

## Architecture

**Stack:** React 18 + TypeScript + Vite, Zustand for state, Firebase Firestore for persistence. Deployed on Netlify (`netlify.toml` handles SPA redirects).

### Data Flow

All app state lives in a single Zustand store (`src/store/useAppStore.ts`). Firebase sync is split into two hooks mounted in `App.tsx`:

- **`useFirebaseSync`** — always-on listeners for `app/results` and `predictions/{uid}` (own predictions). Sets `loading: true` until first results snapshot arrives.
- **`useLazySync`** — tab-triggered listeners. Subscribes to `users` collection when on leaderboard/users tabs; subscribes to all `predictions` when on leaderboard; subscribes to `passwordRequests` when on users tab. Subscriptions are one-way (never re-subscribe once active per session).

### Firestore Schema

| Collection/Doc | Contents |
|---|---|
| `users/{uid}` | `name`, `hashed` (bcrypt), `tempHashed?`, `role?`, `whatsapp?`, `countryCode?` |
| `app/results` | `{[fixtureId]: Result}` — single merged doc |
| `predictions/{uid}` | `{[fixtureId]: Prediction}` — one doc per user |
| `passwordRequests/{uid}` | `PasswordRequest` — cleared on temp pw generation |

Auth is custom: bcrypt on client, no Firebase Auth. Sessions stored in `localStorage` with 15-day expiry (`fifa_session` key).

### Knockout Bracket Generation

When results change, `setResults` in the store immediately calls `buildKO(results)` from `src/data/logic.ts`. This derives the KO fixture list (R32 → Final) by reading group standings and slotting qualifiers into bracket positions. The `ko: Fixture[]` slice in state is always recomputed from scratch on any result update.

### Scoring Logic

`calcTier` in `src/data/logic.ts` returns a tier (0–5) for a single prediction vs result:
- 5 = exact score
- 4 = correct winner + correct GD
- 3 = correct winner or correct draw
- 1 = predicted draw but decisive result
- 0 = wrong winner

KO matches: `+1` bonus for correct penalty winner prediction.

### Admin vs User Roles

`isAdmin` comes from `users/{uid}.role === 'admin'` (set directly in Firestore). Admins see **Results** and **Users** tabs. Admin operations: enter official results (`enterResult`), generate temp passwords (`generateTempForUser`), dismiss password requests (`dismissPwRequest`).

### Tournament Data

All fixture data and group/team definitions are static in `src/data/constants.ts` (`GF` array for group fixtures, `GROUPS` map, `FLAGS` emoji map, KO fixture templates). Editing tournament data means editing that file.

### Modal System

`useAppStore.modal` is `null | { type: 'predict', fixture } | { type: 'result', fixture } | { type: 'rules' }`. `App.tsx` renders the correct modal component based on type.
