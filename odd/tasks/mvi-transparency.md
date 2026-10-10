# MVI transparency panel

Locator: `odd/tasks/mvi-transparency.md` · Engram mirror: `odd/mvi-transparency/tasks`
Branch: `feat/mvi-transparency` (from `release`)

## Objective

Show teachers/admins how MVI (Motor de Validación de Ítems) reviewed each AI-generated question:
status badge, per-attempt timeline, evaluated-criteria checklist, catalog footer.

## Problem / why

The backend (`backend` repo, branch `feat/mvi-transparency`) now returns `mviStatus`, `mviResult`
(with `history` and `rules`), `mviCatalogVersion`, `mviValidatedAt` and `approvedOverMvi` on every
`/api/questions/*` question. The frontend ignores them. This is a key UI moment for the thesis demo.

## Scope

- `Question` type extension + `docs/FRONTEND-INTEGRATION.md` update.
- Rule dictionary (10 known `ruleId`s, catalog `description` fallback).
- `MviStatusBadge` (VakBadge pattern).
- `MviAnalysisDialog` (shadcn Dialog): summary line, timeline, checklist, footer, fallbacks.
- Wiring in `QuestionReviewPage.tsx` ("Validar pregunta" panel) and
  `ValidationHistoryDetailPage.tsx` ("Resultado de validación" card).
- Extra `ConfirmModal` line when approving a `failed` question.

Out of scope: exposing `POST /api/questions/:id/validate` (optional per backend brief).

## Constraints

- Frontend never calls MVI or AI; all data comes from existing question endpoints.
- Spanish hardcoded UI copy, matching the app. Honor `DESIGN.md` tokens and shadcn conventions.
- Students never see this UI (only teacher/admin pages).
- MVI fields may be absent in production until the backend branch deploys: treat missing as `null`.

## Contract source

`../backend/docs/FRONTEND_INTEGRATION.md` (sections around lines 250-425, "MVI diagnosis on questions").

## Tasks

- [x] T1 — Types + docs: extend `Question` with MVI fields and types; update `docs/FRONTEND-INTEGRATION.md`.
- [x] T2 — Rule dictionary + `MviStatusBadge`.
- [x] T3 — `MviAnalysisDialog` with summary, timeline, checklist, footer and fallbacks.
- [x] T4 — Wiring in both pages + `ConfirmModal` observation line.
- [x] T5 — Backend integration review fixes: checklist from `result.violations` (saved text), "Versión guardada" badge, corrections only on `revision`, violation `measuredValue`/`threshold` as `unknown`.

## Acceptance criteria

- `pnpm build` and `pnpm lint` pass.
- Badge labels: passed "Aprobada por el motor", failed "Con observaciones del motor",
  unavailable "Motor no disponible", skipped/null/undefined "Sin validar".
- Dialog handles: full history; absent `history` (final violations + legacy note); absent `rules`
  (no checklist); `unavailable`/`skipped` (explanation, no timeline).
- "Corregido en el intento siguiente" shown when a rule fails in attempt N and not in N+1.
- Approving a `failed` question shows "El motor encontró observaciones; tu aprobación quedará registrada."

## Checks

No test runner configured (test-first exception: no runnable RED). Per task: `pnpm build`, `pnpm lint`.

## Route

All tasks: delegated direct (writer trigger: 4+ non-trivial files across tasks).

## Delivery

Forecast: ~450 authored changed lines. Strategy: `ask-on-risk` (chain strategy asked before PR creation).

## Progress

- Branch created. Feature document created.
- T1 done: MVI types added to `question.interface.ts` (all `Question` MVI fields optional); MVI section added to `docs/FRONTEND-INTEGRATION.md`. `pnpm build`: pass. `pnpm lint`: pass (0 problems). Commit `47edb2a`.
- T2 done: `utils/mvi-rules.ts` (10 known rules + catalog `description` fallback) and `components/MviStatusBadge.tsx` (VakBadge pattern). `pnpm build`: pass. `pnpm lint`: pass. Commit `e4655fb`.
- T3 done: `utils/mvi.ts` (field resolution, rule outcome, corrected-next detection, summary) and `components/MviAnalysisDialog.tsx` (own pill trigger; summary, timeline with native `<details>` options, criteria checklist, catalog footer, legacy/unavailable/skipped/null fallbacks). `pnpm build`: pass. `pnpm lint`: pass. Commit `b2d508a`.
- T4 done: `MviStatusBadge` + `MviAnalysisDialog` trigger in the "Validar pregunta" panel (`QuestionReviewPage`) and the "Resultado de validación" card (`ValidationHistoryDetailPage`, plus "Aprobada pese a observaciones del motor" when `approvedOverMvi`); `ConfirmModal` shows the MVI observation line when approving a `failed` question (copy only, no payload change). `pnpm build`: pass. `pnpm lint`: pass. Commit `ed65ff7`. Not checked: visual run in the browser against a backend that sends MVI fields.
- RDD: range `release..ed65ff7` assessed medium (`slice_budget_reached`, 860 lines); consent granted; `review-reliability` lens approved with no findings; acknowledged (lineage `review-44ca167cf27b6041`).
- T5 done (backend integration review): `CriteriaChecklist` now uses `result.violations` (on failed questions the backend saves the attempt with the fewest blocking violations, not the last one); timeline marks the latest entry matching `question.statement` as "Versión guardada"; "Corregido en el intento siguiente" only when the next entry is a `revision`; violation `measuredValue`/`threshold` widened to `unknown`. `pnpm build`: pass. `pnpm lint`: pass.

## Next step

Push and PR into `release` (user decision), linking backend PR MaterialEngagement-TP202610007/mathE-backend#1 as a dependency.
