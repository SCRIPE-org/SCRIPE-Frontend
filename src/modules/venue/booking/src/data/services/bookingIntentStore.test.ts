import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearBookingIntent,
  getOrCreateBookingIntent,
  recordBookingHoldExpiry,
} from "./bookingIntentStore";

function createBrowserStorage(
  digest: (algorithm: string, input: BufferSource) => Promise<ArrayBuffer> = async (
    _algorithm,
    input
  ) => {
    const bytes = new Uint8Array(input as Uint8Array);
    const value = bytes.reduce((total, byte) => (total + byte) % 256, 0);
    return new Uint8Array([value]).buffer;
  }
) {
  const values = new Map<string, string>();
  let nextId = 0;
  const sessionStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
  const browserWindow = {
    sessionStorage,
    crypto: {
      randomUUID: vi.fn(() => `intent-${++nextId}`),
      subtle: {
        digest: vi.fn(digest),
      },
    },
  };
  vi.stubGlobal("window", browserWindow);
  return { browserWindow, sessionStorage };
}

afterEach(() => {
  clearBookingIntent();
  vi.unstubAllGlobals();
});

describe("bookingIntentStore", () => {
  it("reuses an intent for the same business fingerprint and replaces it for a changed intent", async () => {
    const { sessionStorage } = createBrowserStorage();

    const first = await getOrCreateBookingIntent("party|resource|interval|quantity");
    const replay = await getOrCreateBookingIntent("party|resource|interval|quantity");
    const changed = await getOrCreateBookingIntent("party|resource|different-interval|quantity");

    expect(replay).toEqual(first);
    expect(changed.draftIdempotencyKey).not.toBe(first.draftIdempotencyKey);
    const stored = JSON.parse(sessionStorage.getItem("scripe.venue.booking.intent.v1")!);
    expect(JSON.stringify(stored)).not.toContain("party|resource");
  });

  it("clears the tab-scoped intent when the booking flow completes or is abandoned", async () => {
    const { sessionStorage } = createBrowserStorage();
    await getOrCreateBookingIntent("party|resource|interval|quantity");

    clearBookingIntent();

    expect(sessionStorage.removeItem).toHaveBeenCalledWith("scripe.venue.booking.intent.v1");
  });

  it("renews only the confirmation key when a regenerated quote changes its request fingerprint", async () => {
    createBrowserStorage();
    const first = await getOrCreateBookingIntent("same-booking", "quote-one");
    const replay = await getOrCreateBookingIntent("same-booking", "quote-one");
    const changedQuote = await getOrCreateBookingIntent("same-booking", "quote-two");

    expect(replay).toEqual(first);
    expect(changedQuote.draftIdempotencyKey).toBe(first.draftIdempotencyKey);
    expect(changedQuote.holdIdempotencyKey).toBe(first.holdIdempotencyKey);
    expect(changedQuote.confirmIdempotencyKey).not.toBe(first.confirmIdempotencyKey);
  });

  it("renews an expired hold key from persisted intent while preserving draft and confirmation keys", async () => {
    createBrowserStorage();
    const first = await getOrCreateBookingIntent("same-booking", "quote-1");
    recordBookingHoldExpiry(
      first.draftIdempotencyKey,
      first.holdIdempotencyKey,
      new Date(Date.now() - 1_000).toISOString()
    );

    const resumed = await getOrCreateBookingIntent("same-booking", "quote-1");

    expect(resumed.draftIdempotencyKey).toBe(first.draftIdempotencyKey);
    expect(resumed.holdIdempotencyKey).not.toBe(first.holdIdempotencyKey);
    expect(resumed.confirmIdempotencyKey).toBe(first.confirmIdempotencyKey);
    expect(resumed.holdExpiresAtUtc).toBeUndefined();
  });

  it("does not repopulate storage when an intent is cleared while its fingerprint is hashing", async () => {
    let finishDigest!: (value: ArrayBuffer) => void;
    const pendingDigest = new Promise<ArrayBuffer>((resolve) => {
      finishDigest = resolve;
    });
    const { sessionStorage } = createBrowserStorage(() => pendingDigest);

    const pendingIntent = getOrCreateBookingIntent("abandoned-intent");
    clearBookingIntent();
    finishDigest(new Uint8Array([1, 2, 3]).buffer);
    await pendingIntent;

    expect(sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("keeps retries stable in memory when browser hashing is unavailable", async () => {
    createBrowserStorage(async () => {
      throw new Error("crypto digest unavailable");
    });

    const first = await getOrCreateBookingIntent("same-business-intent", "quote-1");
    const retry = await getOrCreateBookingIntent("same-business-intent", "quote-1");

    expect(retry).toEqual(first);
  });

  it("keeps retries stable in memory when session storage rejects writes", async () => {
    const { sessionStorage } = createBrowserStorage();
    vi.spyOn(sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("session storage unavailable");
    });

    const first = await getOrCreateBookingIntent("same-business-intent");
    const retry = await getOrCreateBookingIntent("same-business-intent");

    expect(retry).toEqual(first);
  });
});
