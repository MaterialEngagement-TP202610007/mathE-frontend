# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Math.E** frontend — React web app for a thesis project (UPC × Colegio Claretiano) that
detects student learning styles (VAK: Visual / Auditory / Kinesthetic). Students take a
10-question quiz; a backend ML classifier (XGBoost) + Gemini AI return a predominant style
plus narrative feedback. Teachers generate/validate AI questions; admins manage users.

This repo is **frontend only**. The backend is a separate Express + JWT REST API. The
authoritative contract lives in `docs/FRONTEND-INTEGRATION.md` — read it before touching any
data-fetching, auth, or routing code.

## Stack

- Vite + React 19 + TypeScript (`type: module`).
- Package manager: **pnpm** (`pnpm-lock.yaml` is the lockfile — do not introduce `package-lock.json`).
- No state/data/router/styling libs installed yet (see "Current state").

## Commands

```bash
pnpm install        # install deps
pnpm dev            # Vite dev server (default http://localhost:5173)
pnpm build          # tsc -b && vite build  (type-checks, then bundles)
pnpm lint           # eslint . (flat config in eslint.config.js)
pnpm preview        # serve the production build
```

No test runner is configured.

## Current state — read before building

The project is an early scaffold. Several things are intentionally incomplete or inconsistent;
do not assume the app runs as-is:

- **Build is broken**: `src/main.tsx` imports `./App.tsx`, which does not exist (deleted).
  Recreate `App.tsx` (or repoint `main.tsx`) before `pnpm dev`/`build` will work.
- **Empty placeholder files**: `src/config/env.config.ts`, `src/router/AppRouter.tsx`,
  `src/router/ProtectedRoute.tsx`, `src/router/PublicRoutes.tsx` are all empty stubs to be filled in.
- **Tailwind is referenced but NOT installed**: `src/styles/base.css` and `animations.css` use
  Tailwind `@apply` with custom tokens (`border-border`, `font-crimson`, `tablet:`/`laptop:`
  breakpoints). There is no `tailwind.config.*`, no `postcss.config.*`, and Tailwind is absent
  from deps. Either install + configure Tailwind (with these tokens) before using those styles,
  or treat them as a spec to implement.
- **No router installed** despite the `src/router/` directory — add `react-router` when wiring routes.

## Architecture & conventions

- `src/config/constant.config.ts` — enums for routes (`ROUTING`), backend endpoints
  (`ENDPOINT_SERVER`), and responsive `BREAKPOINTS` (mobile 475 / tablet 744 / laptop 1232 /
  desktop 1440). Add new route paths and endpoint strings here, not inline.
- Env: `.env` defines `VITE_BASE_URL` (e.g. `http://localhost:3000/api`); `.env.example` is the
  template. Note `docs/FRONTEND-INTEGRATION.md` sample code uses `VITE_API_URL` — reconcile the
  name when implementing the API client.
- Auth/RBAC (per integration guide): JWT Bearer token in `Authorization` header, stored
  client-side. Role ids are integers — `1` Admin, `2` Teacher, `3` Student. On any `401`, clear
  the token and redirect to login. Decode the JWT for routing/guards only — never trust it for
  security. Students register `isActive=false` and cannot log in until an admin activates them.
- The student quiz payload deliberately omits all VAK metadata (no `vakStyle`/`vakValue`) so the
  student isn't biased; teacher-facing question objects include it. Behavioural metrics on each
  answer (time, clicks, changes, reviews) feed the ML model — capture them, don't stub them.

## Design system

`DESIGN.md` is the visual spec (Spanish). Math.E targets a Coursera-like academic, institutional
look: white base + soft blue, brand blue `#0056D2`, pill-shaped buttons/inputs (radius 999px,
min-height 44px), `Source Sans 3` display/body, rounded result/question cards. Honor these tokens
when building UI rather than inventing new ones.

## Vendored agent skills

`.agents/skills/` and `.cursor/rules/` contain pinned third-party skills (tracked in
`skills-lock.json`): `frontend-design`, `shadcn`, `tailwind-design-system`,
`vercel-react-best-practices`. Consult them for component/styling/perf conventions when relevant.

## Repo notes

- `CONTRIBUTING.md`: no external contributions — thesis authors only.
- All external AI API keys belong on the **backend** — never call OpenAI/Gemini/etc. or expose keys from this frontend.
