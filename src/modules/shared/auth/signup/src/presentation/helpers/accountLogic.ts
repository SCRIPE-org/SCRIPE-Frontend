// ═══════════════════════════════════════════════════════════════════════════
// accountLogic — pure logic for the account + workspace phases (F5–F7).
//
// Framework-free so it can be unit-tested without React. The new wizard
// viewmodel reuses these helpers; the components stay dumb.
// ═══════════════════════════════════════════════════════════════════════════

import { SUBDOMAIN_REGEX, SUBDOMAIN_MIN_LENGTH } from "../../domain/constants/signupConstants";

/**
 * Password strength score on a 0–5 scale.
 *
 * Buckets (one point each, capped at 5):
 *   • length ≥ 8, length ≥ 12, has uppercase, has lowercase, has digit, has symbol.
 *
 * Mirrors the legacy orchestrator's scorer verbatim so the meter renders
 * identical buckets — kept here as the single source of truth.
 */
export function calcPasswordStrengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

/**
 * Whether a subdomain is well-formed for the workspace phase: at least the
 * minimum length and matching the allowed-character pattern (lowercase
 * letters/digits, internal hyphens). This is the same client-side rule the
 * availability check applies before hitting the server (which is authoritative).
 */
export function isValidSubdomainFormat(subdomain: string): boolean {
  return subdomain.length >= SUBDOMAIN_MIN_LENGTH && SUBDOMAIN_REGEX.test(subdomain);
}
