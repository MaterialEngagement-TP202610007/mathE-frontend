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

- [x] A1 `feat/hu-compliance-fe-a1` — result and quiz display: HU-28 feedback source, HU-30/32 secondary style,
  HU-52 provisional notice, HU-21 S1 media placeholder, HU-19 S2 block "Siguiente" without answer,
  HU-02/09 send `acceptTerms: true`.
- [x] A2 `feat/hu-compliance-fe-a2` — quiz session flow: HU-16/29 S2 active questionnaire dialog,
  HU-17 S2 generation error + "Reintentar", HU-07/14 S2 idle logout (~30 min) + S1 quiz header logout.
- [x] A3 `feat/hu-compliance-fe-a3` — dashboard and profile: HU-04/11 real totals, HU-05/12 zod per-field validation.
- [x] A4 `feat/hu-compliance-fe-a4` — question lists: HU-40 content-type badge, HU-46 S2 style-specific empty
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
- A1 done on `feat/hu-compliance-fe-a1` (route: delegated direct, writer trigger). Commits: `6dffa11` results display
  (HU-28 source label, HU-30/32 secondary style + description, HU-52 provisional notice; shared
  `src/features/results/utils/result-display.ts`), `6ca97d4` quiz (HU-19 S2 answer required for Siguiente/Revisar with
  `role="alert"` hint; HU-21 S1 placeholder only for explicit `image`/`audio` content types without `mediaUrl`),
  `8a39886` register (`acceptTerms: true` only when accepted). Checks: `pnpm build` pass (existing chunk-size warning),
  `pnpm lint` pass. Production safety: no new endpoint; only additive request field `acceptTerms`; new response field
  `secondaryStyle` on the completion result is optional, with a probability-based fallback and no render when unidentifiable.
  Note: the recovery mapper in `src/features/quiz/utils/complete-questionnaire.ts` (outside A1 surface) drops
  `secondaryStyle`; the probability fallback covers it. The sidebar "Finalizar cuestionario" still opens the review screen,
  whose submit already requires all answers.
- A2 done on `feat/hu-compliance-fe-a2` (route: delegated direct, writer trigger; ~520 authored lines, over the advisory
  heuristic because three HUs share the quiz page). Commits: `a1c06f2` HU-16/29 S2 reusable
  `ActiveQuestionnaireDialog` ("Continuar" / "Iniciar nuevo"; start-new calls the existing abandon endpoint, treats
  "already abandoned" as success, clears the local quiz session and sets availability to available; on failure toasts and
  stays usable) used from the 409 branch of `QuizPage`, from `QuizPage` when consent arrives with a local in-progress
  session (sidebar "Nuevo cuestionario"), and from every DashboardHome start/resume CTA; dashboard "Iniciar nuevo" reopens
  the terms modal so the new questionnaire still requires fresh consent. `8a10233` HU-17 S2 generation error state on
  `GeneratingQuiz` with "Reintentar" (re-runs the same creation flow, including the 409 check) and "Volver al inicio";
  no toast/redirect. `1d4bccc` HU-07/14 S2 `useIdleLogout` (30 min `IDLE_LOGOUT_MS`; pointer/key/wheel/touch/scroll
  throttled to one reset per 5 s via timers and refs; last activity shared across tabs in localStorage so an active tab
  keeps the shared cookie session alive; returning to a tab already idle past the limit logs out instead of extending)
  mounted in `DashboardLayout` and `QuizPage` (quiz route is outside the layout); signs out through the store `logout`
  with new options `{ keepQuiz, reason }` and the login screen shows "Tu sesión se cerró por inactividad." from an
  in-memory `logoutReason`. HU-07/14 S1 "Cerrar sesión" in the quiz header, with a confirm dialog while answering;
  the questionnaire is not abandoned and the local copy is kept (`keepQuiz`). Checks: `pnpm build` pass (existing
  chunk-size warning), `pnpm lint` pass. Production safety: no new endpoint, no request-shape change (abandon and logout
  already exist); Sidebar `logout()` call unchanged. Decision: no explicit "submission in flight" guard; the submit
  click resets the idle timer and submission finishes within seconds, far below 30 minutes.
  Review fix (production safety, `fix(quiz): abandon active questionnaire only after consent`): dashboard
  "Iniciar nuevo" now only records the intent (`replaceQuestionnaireId` in the quiz-intro store) and opens the terms
  modal; cancelling the modal clears the intent and abandons nothing. The quiz page abandons the active questionnaire
  only after consent, immediately before `POST /questionnaires` (abandon failure shows the retryable error state).
  `ActiveQuestionnaireDialog` no longer abandons by itself; callers do it via `utils/abandon-active-questionnaire.ts`,
  and the in-quiz dialog (consent already given) abandons right before creating.

- A3 done on `feat/hu-compliance-fe-a3` (route: delegated direct, writer trigger). Commits: `7144cbd` HU-04/11
  dashboard totals: student "Cuestionarios realizados" uses `total` from the existing `GET /results/my` response
  (request unchanged, `limit: 5`), with "Desde <fecha>" only when the loaded page holds every result, otherwise
  "Último: <fecha>"; teacher cards show full-period pending/approved/rejected totals from `GET /questions/my?status=`
  (`limit: 1` for approved/rejected, already used in `QuestionReviewPage`), loaded with `Promise.allSettled` so a failed
  count shows "—" / "No se pudo cargar" without hiding the others. Labels changed from "Aprobadas/Rechazadas este mes"
  to "Preguntas aprobadas/rechazadas" + "En total" (the data is no longer month-scoped); unused `isThisMonth` removed.
  `10bcaf8` HU-05/12 profile: new `src/features/users/schemas/profile.schema.ts` (name required trimmed, max 100;
  phone register/backend regex or empty; valid birth date), inline errors under each field with `aria-invalid` +
  `aria-describedby`, school error through the existing `SchoolSearchBox` error prop, errors cleared on edit; a stored
  birth date cannot be cleared; API failures keep the toast. Decision: unchanged stored name/phone values are not
  re-validated, so legacy data never blocks saving other fields. Payload shape unchanged (same conditional fields).
  Checks: `pnpm build` pass (existing chunk-size warning), `pnpm lint` pass. Production safety: no new endpoint, no new
  query param (`status`, `page`, `limit` documented for `/questions/my`), no request-shape change.
- A4 done on `feat/hu-compliance-fe-a4` (route: delegated direct, writer trigger; ~167 authored lines). Commits:
  `3e12231` HU-40 new `ContentTypeBadge` (Texto/Imagen/Audio pill, VakBadge pattern; missing/unknown `contentType`
  renders nothing) in the "Tipo" column of both list pages (the history "Tipo" column previously duplicated the VAK
  badge; the pending list gains an "Estilo" column for the VAK badge) and in the `QuestionRow` meta line; list tables
  now scroll inside their card (`overflow-x-auto`) instead of being clipped, so the page never overflows horizontally.
  `706d59a` HU-46 S2 style-specific empty messages using the existing `toSpanishStyle` map ("No hay preguntas de estilo
  Visual pendientes de validación." / "No hay preguntas[ aprobadas| rechazadas] de estilo Auditivo en el historial.");
  shown when the style filter is active without search/date filters (those keep "Prueba ajustando los filtros"); no
  filter keeps the original generic message. `64f0a10` HU-58/60 `MviStatusBadge` gains optional `size="sm"` (default
  rendering unchanged) and new `MviRowMarkers` / `ApprovedOverMviMarker` ("Aprobada sobre MVI") rendered under the
  statement in both list pages and in `QuestionRow`, wrapping on narrow screens. Decision: the MVI badge renders only
  when `mviStatus` is present (non-null/undefined), so legacy production rows show no "Sin validar" noise; the marker
  renders only when `approvedOverMvi` is true. Checks: `pnpm build` pass (existing chunk-size warning), `pnpm lint`
  pass. Production safety: display-only, no new endpoint, no request change, all read fields already optional.

## Next step

A5.
