# Branching Strategy (owned by F)

- `main` — always deployable. Only F merges into this, after a smoke test.
- One branch per person, per module: `a-booking`, `b-weather`, `c-transactions`,
  `d-dashboard`, `e-grievance`, `f-integration`.
- Nobody commits directly to `main`. Open a PR into `main`, F reviews + merges.
- **Merge cadence:** end of every day, not continuously. Merging once a day keeps
  conflicts small and gives F a fixed daily checkpoint to smoke-test against
  (matches the Day 3/4/5/6/7 "smoke test" checkpoints in the build plan).
- If your route/endpoint needs to deviate from `API_CONTRACT.md`, that's a message
  in the group chat before you write the code — not after.
- Contract changes get a one-line entry at the bottom of `API_CONTRACT.md` with
  the date, so nobody's confused about which version is current.

## Daily flow
1. Pull latest `main` first thing.
2. Work on your branch all day.
3. Open PR before end of day.
4. F merges + runs `npm run dev` in `/backend`, hits `/api/health` and your new
   endpoints, confirms nothing else broke.
5. If it breaks something else, F flags it back to you same day — not next
   morning.
