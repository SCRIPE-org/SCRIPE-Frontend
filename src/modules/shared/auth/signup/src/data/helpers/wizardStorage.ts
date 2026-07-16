// ═══════════════════════════════════════════════════════════════════════════
// wizardStorage — sessionStorage Helpers
//
// All wizard persistence goes through here. No magic strings — all keys
// are referenced via STORAGE_KEYS from the core config.
//
// Why sessionStorage?
//  - The wizard must survive a redirect to Stripe and back (cancel_url).
//  - Data is automatically cleared when the browser tab closes (security win).
//  - Password is NEVER persisted (excluded from PersistedWizardState).
// ═══════════════════════════════════════════════════════════════════════════

import { STORAGE_KEYS } from "@core/config/storage-keys";
import type { PersistedWizardState } from "../../domain/entities";

const CHECKOUT_SESSION_STORAGE_TTL_MS = 48 * 60 * 60 * 1000;
const CHECKOUT_SESSION_STORAGE_FUTURE_SKEW_MS = 5 * 60 * 1000;

interface PersistedCheckoutSessionReference {
  sessionId: string;
  savedAt: number;
}

/**
 * Persist wizard snapshot to sessionStorage.
 * Safe to call in private mode — failure is silently swallowed.
 */
export function persistWizardState(state: PersistedWizardState): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SIGNUP_WIZARD, JSON.stringify(state));
  } catch {
    // Storage unavailable (private/incognito mode).
    // The wizard still works; the user just can't resume after a Stripe redirect.
  }
}

/**
 * Read wizard snapshot from sessionStorage.
 * Returns null if nothing is stored, storage is unavailable, or JSON is corrupt.
 */
export function readPersistedWizardState(): PersistedWizardState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SIGNUP_WIZARD);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedWizardState;
  } catch {
    return null;
  }
}

/**
 * Remove wizard snapshot + signup ref from sessionStorage.
 * Called on successful provisioning or when the user starts a fresh signup.
 */
export function clearPersistedWizardState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_WIZARD);
    sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_REF);
  } catch {
    // Storage unavailable — nothing to clean.
  }
}

/**
 * Persist direct Checkout Session ID so /signup/complete can recover after
 * query cleanup, refresh, or browser restart. This is not payment proof.
 */
export function persistSignupCheckoutSessionId(sessionId: string): void {
  const normalized = sessionId.trim();
  if (!normalized) return;

  try {
    const payload: PersistedCheckoutSessionReference = {
      sessionId: normalized,
      savedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.SIGNUP_CHECKOUT_SESSION, JSON.stringify(payload));
  } catch {
    // Storage unavailable — finalize still works with the Stripe ?session_id param.
  }
}

/**
 * Read the direct Checkout Session ID used for public-safe status polling.
 * Expire the browser hint so stale visits cannot keep polling old checkout
 * sessions forever. Legacy bare string values are migrated once.
 */
export function getPersistedSignupCheckoutSessionId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIGNUP_CHECKOUT_SESSION);
    if (!raw) return null;

    const stored = raw.trim();
    if (!stored) {
      clearPersistedSignupCheckoutSessionId();
      return null;
    }

    if (!stored.startsWith("{")) {
      persistSignupCheckoutSessionId(stored);
      return stored;
    }

    const parsed = JSON.parse(stored) as Partial<PersistedCheckoutSessionReference>;
    const sessionId = typeof parsed.sessionId === "string" ? parsed.sessionId.trim() : "";
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
    const now = Date.now();

    if (
      !sessionId ||
      savedAt <= 0 ||
      savedAt > now + CHECKOUT_SESSION_STORAGE_FUTURE_SKEW_MS ||
      now - savedAt > CHECKOUT_SESSION_STORAGE_TTL_MS
    ) {
      clearPersistedSignupCheckoutSessionId();
      return null;
    }

    return sessionId;
  } catch {
    clearPersistedSignupCheckoutSessionId();
    return null;
  }
}

/**
 * Clear the direct Checkout Session ID when the user starts a fresh signup.
 */
export function clearPersistedSignupCheckoutSessionId(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SIGNUP_CHECKOUT_SESSION);
  } catch {
    // Storage unavailable — nothing to clean.
  }
}

/**
 * Persist the signup ref token used by the finalize page to poll status.
 * Also stored for the Stripe cancel-url round-trip.
 */
export function persistSignupRef(ref: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SIGNUP_REF, ref);
  } catch {
    // Private mode — finalize falls back to the ?ref= URL param.
  }
}

/**
 * Read the persisted signup ref from sessionStorage.
 * Returns null if not present or storage is unavailable.
 * Used by the resume flow and the change-plan detection in useSignupProvisioning.
 */
export function getPersistedSignupRef(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SIGNUP_REF);
  } catch {
    return null;
  }
}
