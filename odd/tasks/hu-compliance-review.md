# HU compliance review — frontend phase A

Locator: `odd/tasks/hu-compliance-review.md` · Engram mirror: `odd/hu-compliance-review/tasks`
Tracker branch: `feat/hu-compliance-review` (from `origin/release` ec28059). Feature-branch chain:
each slice `feat/hu-compliance-fe-aN` branches from the previous slice (a1 from the tracker).
Requested by backend session `backend-f7` (backend locator: backend repo `odd/tasks/hu-compliance-review.md`);
user authorized on 2026-10-10 with the condition: no breaking change, nothing that can break production.

## Objective

Close the frontend-only gaps from the 2026-10-10 static audit of user stories HU-01..HU-60.
Out of scope (user decision): password recovery (HU-06 "–", HU-13), HU-01 confirmation email, HU-41 audio.
Phase B (backend-dependent) waits for contracts from `backend-f7`.

## Constraints

- No push, no PRs: the user decides delivery.
- Production safety: only endpoints that already exist on the deployed backend (`origin/main`): verified
  `PATCH /api/results/:id/correct-label`, `PATCH /api/questionnaires/:id/abandon`,
  `GET /api/results/evolution/:studentId` (student: own only). `acceptTerms` is ignored by the deployed
  register DTO, so sending it is safe before backend BE1 deploys.
- Role split (HU-15) must keep Admin access to everything it reaches today.
- UI copy in Spanish (project language); code, comments, commits in English. Conventional Commits, no AI attribution.
- ~400 authored changed lines per slice is an advisory planning heuristic only.

## Tasks

- [ ] A1 `feat/hu-compliance-fe-a1` — result and quiz display: HU-28 feedback source, HU-30/32 secondary style,
  HU-52 provisional notice, HU-21 S1 media placeholder, HU-19 S2 block "Siguiente" without answer,
  HU-02/09 send `acceptTerms: true`.
- [ ] A2 `feat/hu-compliance-fe-a2` — quiz session flow: HU-16/29 S2 active questionnaire dialog,
  HU-17 S2 generation error + "Reintentar", HU-07/14 S2 idle logout (~30 min) + S1 quiz header logout.
- [ ] A3 `feat/hu-compliance-fe-a3` — dashboard and profile: HU-04/11 real totals, HU-05/12 zod per-field validation.
- [ ] A4 `feat/hu-compliance-fe-a4` — question lists: HU-40 content-type badge, HU-46 S2 style-specific empty
  message, HU-58/60 MVI status column + "Aprobada sobre MVI" marker.
- [ ] A5 `feat/hu-compliance-fe-a5` — results and reports: HU-36 S2 grade selector + empty grade message,
  HU-35 S2 mark `result_available` notification read on detail open, HU-54 S1 error panel with support link.
- [ ] A6 `feat/hu-compliance-fe-a6` — HU-15 per-role routes, HU-34 student evolution access + presets + min-two message.
- [ ] A7 `feat/hu-compliance-fe-a7` — HU-44 label correction screen (`PATCH /api/results/:id/correct-label`).

## Checks

No test runner (test-first exception: no runnable RED). Per slice: `tsc -b`, `eslint .`, `vite build`
(`pnpm build` + `pnpm lint`), plus a production-safety note (no new endpoint, no contract change).

## Route

Each slice: delegated direct (writer trigger: 2+ non-trivial files per slice).

## Delivery

Strategy: `feature-branch-chain` (user decision relayed by `backend-f7`). Forecast ~1,800–2,400 authored
lines across 7 slices. Slice boundaries = one child branch per slice.

## Progress

- Tracker branch checked out. Feature document created. Endpoint and `acceptTerms` safety verified against backend `origin/main`.

## Next step

A1.
