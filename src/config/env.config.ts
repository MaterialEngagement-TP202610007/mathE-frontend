/**
 * Typed access to Vite env vars.
 *
 * VITE_API_URL — backend host only, no trailing slash, no /api suffix.
 *   Dev:  leave unset (or set to "") → relative /api/* URLs → Vite proxy → localhost:3000
 *   Prod: leave unset (or set to "") → relative /api/* URLs → Netlify proxy → Render backend
 *         OR set to "https://your-backend.onrender.com" for direct (non-proxied) deployments
 *
 * See docs/PRODUCTION_DEPLOYMENT.md for full setup.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export const ENV = {
  /** Backend host — empty in dev/Netlify-proxy setups, absolute URL for direct Render deployments. */
  API_URL,
  /** Full API base for axios — always ends at /api */
  BASE_URL: `${API_URL}/api`,
} as const;
