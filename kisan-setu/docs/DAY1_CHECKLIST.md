# Day 1 Checklist — F runs this today

- [ ] Share `API_CONTRACT.md` with everyone — walk through it together, 20 min max.
      Anyone who disagrees with a shape speaks now, not on Day 5.
- [ ] Everyone clones the repo.
- [ ] `cd backend && npm install && cp .env.example .env && npm run dev`
- [ ] Everyone confirms they can hit `http://localhost:4000/api/health` and
      `http://localhost:4000/api/centres` and get real JSON back.
- [ ] Each person creates their branch (see BRANCHING.md) off `main`.
- [ ] B: get an OpenWeatherMap free-tier API key, drop it in `.env` as
      `OWM_API_KEY` when ready — weather route already works without it
      (deterministic mock fallback), so this isn't a blocker.
- [ ] A: start replacing the in-memory `bookings`/`bookingCounts` Maps in
      `data/store.js` with real persistence — keep every function signature
      identical so nobody else's code needs to change.
- [ ] C: same deal for the transaction/QR logic.
- [ ] D/E: start frontend work directly against the running mock server via
      `frontend-shared/apiClient.js` — no local hand-rolled mocks needed, the
      real (mock) server already returns contract-shaped JSON.
- [ ] F: confirm staging deploy target exists (Render/Railway/Vercel — pick one,
      don't overthink it) so Day 7's integration isn't the first time anyone
      deploys.

**By end of Day 1:** repo cloned by all 6, mock server running locally for
everyone, contract frozen and shared, branches created. Nobody is blocked
starting tomorrow.

## F-specific, today (this is on you, not the team)

- [ ] Push this scaffold to a real GitHub repo, share the link.
- [ ] Turn on branch protection on `main` — PR required, no direct pushes.
- [ ] Stand up the real staging deploy target today (Render/Railway/Fly.io —
      pick one, deploy the backend as-is right now). Don't leave this for
      Day 7 — that's the worst day to discover deploy is fiddly.
- [ ] From a **clean clone** (not your working folder): `npm install`,
      `npm run dev`, then `npm run smoke` — confirms every contract endpoint
      actually works before the team starts hitting it.
- [ ] Confirm the GitHub Actions smoke test (`.github/workflows/smoke-test.yml`)
      goes green on the first push to `main` — this is what runs
      automatically on every PR from here on, so you're not manually running
      `npm run smoke` by hand after every merge.
- [ ] Run the team checklist above live, on a call — watch each person clone
      and run it themselves so you catch "works on my machine" problems today,
      not tomorrow.
