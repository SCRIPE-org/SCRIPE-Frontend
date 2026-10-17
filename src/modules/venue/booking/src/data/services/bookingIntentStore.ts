import type { BookingBusinessIntent } from "../../domain/entities/Booking";

const STORAGE_KEY = "scripe.venue.booking.intent.v1";
const encoder = new TextEncoder();
let storageGeneration = 0;
let memoryIntent: {
  fingerprint: string;
  confirmationFingerprint?: string;
  intent: BookingBusinessIntent;
} | null = null;

function newIntent(): BookingBusinessIntent {
  const browserCrypto = typeof window === "undefined" ? undefined : window.crypto;
  if (!browserCrypto?.randomUUID) throw new Error("Secure booking intent generation is unavailable.");
  return {
    draftIdempotencyKey: browserCrypto.randomUUID(),
    holdIdempotencyKey: browserCrypto.randomUUID(),
    confirmIdempotencyKey: browserCrypto.randomUUID(),
  };
}

async function fingerprintDigest(fingerprint: string): Promise<string> {
  const digest = await window.crypto.subtle.digest("SHA-256", encoder.encode(fingerprint));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

function isStoredIntent(value: unknown): value is BookingBusinessIntent & {
  fingerprintDigest: string;
  confirmationFingerprintDigest?: string;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.fingerprintDigest === "string" &&
    typeof candidate.draftIdempotencyKey === "string" &&
    typeof candidate.holdIdempotencyKey === "string" &&
    typeof candidate.confirmIdempotencyKey === "string" &&
    (candidate.holdExpiresAtUtc === undefined || typeof candidate.holdExpiresAtUtc === "string");
}

function isExpired(expiresAtUtc: string): boolean {
  const expiresAt = Date.parse(expiresAtUtc);
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

function reuseInMemoryIntent(
  fingerprint: string,
  confirmationFingerprint: string | undefined,
  candidate: BookingBusinessIntent
): BookingBusinessIntent {
  if (memoryIntent?.fingerprint === fingerprint) {
    const intent = { ...memoryIntent.intent };
    if (intent.holdExpiresAtUtc && isExpired(intent.holdExpiresAtUtc)) {
      intent.holdIdempotencyKey = candidate.holdIdempotencyKey;
      delete intent.holdExpiresAtUtc;
    }
    if (
      confirmationFingerprint !== undefined &&
      memoryIntent.confirmationFingerprint !== confirmationFingerprint
    ) {
      intent.confirmIdempotencyKey = candidate.confirmIdempotencyKey;
    }
    memoryIntent = {
      ...memoryIntent,
      confirmationFingerprint: confirmationFingerprint ?? memoryIntent.confirmationFingerprint,
      intent,
    };
    return intent;
  }

  memoryIntent = { fingerprint, confirmationFingerprint, intent: candidate };
  return candidate;
}

/**
 * Keeps only opaque intent keys in tab-scoped storage. The semantic fingerprint is hashed so
 * customer/resource identifiers and schedule values never enter browser storage as cleartext.
 * Storage or hashing failures fall back to an in-memory intent; callers retain that key in their
 * mounted viewmodel for normal retry behavior. Secure UUID generation remains required by the API.
 */
export async function getOrCreateBookingIntent(
  fingerprint: string,
  confirmationFingerprint?: string
): Promise<BookingBusinessIntent> {
  if (typeof window === "undefined" || !window.crypto?.randomUUID) {
    throw new Error("Secure booking intent storage is unavailable.");
  }
  const intent = newIntent();
  if (!window.crypto.subtle) {
    return reuseInMemoryIntent(fingerprint, confirmationFingerprint, intent);
  }
  const generation = storageGeneration;

  try {
    const fingerprintDigestValue = await fingerprintDigest(fingerprint);
    const confirmationDigestValue = confirmationFingerprint
      ? await fingerprintDigest(`${fingerprint}\u0000${confirmationFingerprint}`)
      : undefined;
    if (generation !== storageGeneration) return intent;
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      const parsed: unknown = JSON.parse(storedValue);
      if (isStoredIntent(parsed) && parsed.fingerprintDigest === fingerprintDigestValue) {
        const confirmationKeyChanged = confirmationDigestValue !== undefined &&
          parsed.confirmationFingerprintDigest !== confirmationDigestValue;
        const holdExpired = typeof parsed.holdExpiresAtUtc === "string" &&
          isExpired(parsed.holdExpiresAtUtc);
        const current: BookingBusinessIntent = {
          draftIdempotencyKey: parsed.draftIdempotencyKey,
          holdIdempotencyKey: holdExpired ? intent.holdIdempotencyKey : parsed.holdIdempotencyKey,
          confirmIdempotencyKey: confirmationKeyChanged ? intent.confirmIdempotencyKey : parsed.confirmIdempotencyKey,
          ...(holdExpired || !parsed.holdExpiresAtUtc
            ? {}
            : { holdExpiresAtUtc: parsed.holdExpiresAtUtc }),
        };
        memoryIntent = {
          fingerprint,
          confirmationFingerprint: confirmationFingerprint ?? (
            memoryIntent?.fingerprint === fingerprint
              ? memoryIntent.confirmationFingerprint
              : undefined
          ),
          intent: current,
        };
        if (!confirmationKeyChanged && !holdExpired) return current;

        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...current,
          fingerprintDigest: fingerprintDigestValue,
          ...(confirmationDigestValue || parsed.confirmationFingerprintDigest
            ? { confirmationFingerprintDigest: confirmationDigestValue ?? parsed.confirmationFingerprintDigest }
            : {}),
        }));
        return current;
      }
    }

    const storedIntent = {
      ...intent,
      fingerprintDigest: fingerprintDigestValue,
      ...(confirmationDigestValue ? { confirmationFingerprintDigest: confirmationDigestValue } : {}),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedIntent));
    memoryIntent = { fingerprint, confirmationFingerprint, intent };
  } catch {
    return reuseInMemoryIntent(fingerprint, confirmationFingerprint, intent);
  }

  return intent;
}

export function recordBookingHoldExpiry(
  draftIdempotencyKey: string,
  holdIdempotencyKey: string,
  expiresAtUtc: string
): void {
  if (
    !memoryIntent ||
    memoryIntent.intent.draftIdempotencyKey !== draftIdempotencyKey ||
    memoryIntent.intent.holdIdempotencyKey !== holdIdempotencyKey
  ) {
    return;
  }

  memoryIntent = {
    ...memoryIntent,
    intent: { ...memoryIntent.intent, holdExpiresAtUtc: expiresAtUtc },
  };

  try {
    if (typeof window === "undefined") return;
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedValue) return;
    const parsed: unknown = JSON.parse(storedValue);
    if (
      !isStoredIntent(parsed) ||
      parsed.draftIdempotencyKey !== draftIdempotencyKey ||
      parsed.holdIdempotencyKey !== holdIdempotencyKey
    ) {
      return;
    }
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, holdExpiresAtUtc: expiresAtUtc })
    );
  } catch {
    // In-memory expiry still protects the active view when browser storage is unavailable.
  }
}

export function clearBookingIntent(): void {
  storageGeneration += 1;
  memoryIntent = null;
  try {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Browser storage may be disabled; the viewmodel still clears its in-memory intent.
  }
}
