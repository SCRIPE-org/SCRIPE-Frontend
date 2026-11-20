export type IntentKeyRef = {
  current: { fingerprint: string; key: string } | null;
};

export type QuoteIntentRef = {
  current: { fingerprint: string; key: string; expiresAtUtc: string } | null;
};

/**
 * Returns a stable idempotency key for the active business fingerprint,
 * regenerating only when the caller changes payload semantics.
 */
export function getIntentKey(ref: IntentKeyRef, fingerprint: string): string {
  if (ref.current?.fingerprint !== fingerprint) {
    ref.current = { fingerprint, key: crypto.randomUUID() };
  }
  return ref.current.key;
}

/**
 * Returns an active 15-minute quote idempotency key + expiry for the given fingerprint.
 */
export function getQuoteIntent(
  ref: QuoteIntentRef,
  fingerprint: string,
): { key: string; expiresAtUtc: string } {
  const current = ref.current;
  if (
    !current ||
    current.fingerprint !== fingerprint ||
    !Number.isFinite(Date.parse(current.expiresAtUtc)) ||
    Date.parse(current.expiresAtUtc) <= Date.now()
  ) {
    ref.current = {
      fingerprint,
      key: crypto.randomUUID(),
      expiresAtUtc: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }
  return ref.current!;
}

/**
 * Computes the next rounded slot instant UTC string using the specified increment.
 */
export function getNextSlotInstantUtc(incrementMinutes: number = 30): string {
  const d = new Date();
  const ms = 1000 * 60 * incrementMinutes;
  return new Date(Math.ceil(d.getTime() / ms) * ms).toISOString();
}

/**
 * Formats a UTC instant into a local `YYYY-MM-DDTHH:mm:ss` string in the specified IANA zone.
 */
export function toLocalIsoDateTime(utcIso: string, timeZone: string): string {
  const d = new Date(utcIso);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
  return formatter.format(d).replace(", ", "T").replace(" ", "T");
}

/**
 * Extracts a safe display message from unknown API or Error values.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const candidate = err as {
      response?: { data?: { title?: string; message?: string } };
      message?: string;
    };
    const msg =
      candidate.response?.data?.title ||
      candidate.response?.data?.message ||
      (err instanceof Error ? err.message : candidate.message);
    if (typeof msg === "string" && msg.trim().length > 0) {
      return msg;
    }
  }
  return fallback;
}

/**
 * Detects slot conflict / double-booking errors returned by booking endpoints.
 */
export function isConflictError(err: unknown): boolean {
  const errMsg = err instanceof Error ? err.message : String(err);
  return (
    errMsg.includes("409") ||
    errMsg.includes("Conflict") ||
    errMsg.includes("overlap") ||
    errMsg.includes("already booked")
  );
}
