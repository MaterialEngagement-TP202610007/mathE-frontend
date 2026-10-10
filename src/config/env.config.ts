/**
 * Typed access to Vite env vars.
 *
 * VITE_API_URL — backend host only, no trailing slash, no /api suffix.
 *   Dev:  leave unset (or set to "") → relative /api/* URLs → Vite proxy → localhost:3000
 *   Prod: leave unset (or set to "") → relative /api/* URLs → Netlify proxy → Render backend
 *         OR set to "https://your-backend.onrender.com" for direct (non-proxied) deployments
 *
 * VITE_SUPPORT_EMAIL — optional support contact shown on error screens ("Contactar soporte").
 *   Leave unset to hide the support link; no address is ever invented.
 *
 * See docs/PRODUCTION_DEPLOYMENT.md for full setup.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const SUPPORT_EMAIL = ((import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ?? "").trim();

export const ENV = {
  /** Backend host — empty in dev/Netlify-proxy setups, absolute URL for direct Render deployments. */
  API_URL,
  /** Full API base for axios — always ends at /api */
  BASE_URL: `${API_URL}/api`,
  /** Support contact address — empty when not configured (support links are hidden). */
  SUPPORT_EMAIL,
} as const;

/** `mailto:` link to the configured support address, or `null` when VITE_SUPPORT_EMAIL is unset. */
export function getSupportMailto(subject?: string): string | null {
  if (!ENV.SUPPORT_EMAIL) return null;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${ENV.SUPPORT_EMAIL}${query}`;
}
