/**
 * Typed access to Vite env vars.
 *
 * The API base URL is read from `VITE_BASE_URL` (see `.env.example`).
 * `docs/FRONTEND-INTEGRATION.md` sample code uses `VITE_API_URL`; we
 * standardise on `VITE_BASE_URL` here — keep `.env` in sync.
 */
const BASE_URL = import.meta.env.VITE_BASE_URL as string | undefined

if (!BASE_URL) {
  // Surface misconfiguration early instead of firing requests at `undefined/...`.
  console.warn(
    "[env] VITE_BASE_URL is not set — copy .env.example to .env. Falling back to http://localhost:3000/api",
  )
}

export const ENV = {
  BASE_URL: BASE_URL ?? "http://localhost:3000/api",
} as const
