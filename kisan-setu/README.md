# Kisan Setu — Repo

SIH26032 | Team NEXOFORGE

## What's here right now (Day 1)

- `API_CONTRACT.md` — the frozen contract. Read this first.
- `backend/` — a **real, running** Express server implementing every endpoint
  in the contract against in-memory data. Not a doc, not a stub — it returns
  real JSON right now. A and C will swap the in-memory logic for real
  persistence over the coming days; the URLs and response shapes won't change.
- `frontend-shared/apiClient.js` — the one file every frontend (farmer app,
  buyer dashboard, agent portal) should import instead of calling `fetch()`
  directly.
- `docs/BRANCHING.md` — how we merge without stepping on each other.
- `docs/DAY1_CHECKLIST.md` — run through this today, as a team.

## Quick start (everyone, today)

```bash
git clone <repo-url>
cd kisan-setu/backend
npm install
cp .env.example .env
npm run dev
```

Then open `http://localhost:4000/api/centres` in a browser — if you see JSON,
you're ready to build against it.

## Why this exists

Nobody waits for anybody else's *finished* code — only the *agreed shape* of
it, and that's already built and running as of today. Build your module
against these live endpoints now; when A and C add real database logic behind
them later this week, your frontend code doesn't change at all.
