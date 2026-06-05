# ⚽ FIFA World Cup 2026 — Prediction League

A real-time prediction league web app for FIFA World Cup 2026. Compete with friends by predicting match scores across all 104 matches — group stage through the final.

🔗 **Live App:** [https://cheriyansomaman.github.io/fifa-2026-prediction/](https://cheriyansomaman.github.io/fifa-2026-prediction/)

---

## Features

- **Predict any match** — Enter score predictions for all 104 matches (group stage + full knockout bracket)
- **Real-time updates** — Leaderboard, standings, and results sync live via Firebase Firestore
- **Auto-generated knockout bracket** — R32 → R16 → QF → SF → Final auto-populates from group results
- **Group standings** — Live or prediction-based standings for all 12 groups (A–L)
- **Leaderboard** — Ranked scoreboard for all players
- **Admin panel** — Enter official results, manage users, generate temporary passwords
- **Session persistence** — Login stays active for 15 days via localStorage
- **Penalty shootout support** — Predict penalty winners for drawn KO matches

---

## Scoring System

| Prediction | Points |
|---|---|
| Exact score (e.g. 2–1 predicted, 2–1 result) | **5 pts** |
| Correct winner + correct goal difference | **4 pts** |
| Correct winner (any margin) | **3 pts** |
| Predicted draw, actual draw (wrong score) | **3 pts** |
| Predicted draw, result was decisive | **1 pt** |
| Wrong winner | **0 pts** |

KO stage: penalty shootout winner prediction awards **+1 bonus pt**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS (no framework), HTML, CSS |
| Database | Firebase Firestore (real-time listeners) |
| Auth | Username + bcrypt password (client-side hashing) |
| Hosting | GitHub Pages |
| Fonts | Barlow Condensed, Barlow (Google Fonts) |
| Flags | [flagcdn.com](https://flagcdn.com) |

---

## Tournament Structure

- **48 teams** across **12 groups** (A–L), 4 teams per group
- **48 group stage matches** (6 per group)
- **Round of 32** — 16 matches (top 2 per group + 8 best 3rd-place teams)
- **Round of 16** — 8 matches
- **Quarter Finals** — 4 matches
- **Semi Finals** — 2 matches
- **Final** — 1 match

---

## How to Play

1. Open the [live app](https://cheriyansomaman.github.io/fifa-2026-prediction/)
2. Enter a username and password → account created automatically on first login
3. Go to **Fixtures** tab → click **⚽ Predict** on any open match
4. Predictions lock **1 hour before kickoff**
5. Points awarded automatically when admin enters official results
6. Track your rank on the **Leaderboard** tab

---

## Admin Features

Admins (role set in Firestore) get two extra tabs:

- **Results** — Enter/update official scores for group and KO matches inline
- **Users** — View all players, generate temporary passwords for account recovery

Temp passwords force a password change on next login.

---

## Local Development

Create a local env file from `.env.example` and fill in your Firebase values.

```bash
cp .env.example .env
# then edit .env with your Firebase config
```

Run the app locally with Vite:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

> The service worker is only registered in production builds, so local development should load without SW caching delays.

### Environment variables

- Local dev uses `.env` / `.env.local`
- Netlify build uses the same `VITE_FIREBASE_*` environment variables defined in Netlify site settings

The app reads these values from `src/firebase.ts` via `import.meta.env`.

---

## Project Structure

```
fifa/
├── index.html        # App shell (JS module entry point)
├── main.js           # All app logic, UI rendering, Firebase integration
├── styles.css        # Global styles, grid layouts, animations
├── wc2026-logo.png   # World Cup 2026 logo
└── point_rules.md    # Scoring rules reference
```

---

## Deployment

Hosted on GitHub Pages. Any push to `main` deploys automatically if Pages is configured to serve from root.

```bash
git add -A && git commit -m "update" && git push
```
