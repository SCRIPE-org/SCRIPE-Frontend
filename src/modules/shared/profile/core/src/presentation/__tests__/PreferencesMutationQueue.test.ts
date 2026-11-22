import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreferencesMutationQueue } from "../viewmodels/usePreferencesMutationQueue";
import type { SovereignPreferencesSlice } from "../../domain/entities/SovereignAccountEntities";

function createPrefs(overrides: Partial<SovereignPreferencesSlice> = {}): SovereignPreferencesSlice {
  return {
    themeMode: "dark",
    clubAccentHue: "signal-lime",
    density: "comfortable",
    defaultLandingRoute: "/overview",
    sidebarCollapsedByDefault: false,
    broadcastPrivacyBlurDefault: false,
    reducedMotionEnabled: false,
    languageCode: "en",
    operatingTimezone: "UTC",
    numeralSystem: "western",
    firstDayOfWeek: "monday",
    customHotkeysJson: "{}",
    savedFilterPresetsJson: "[]",
    rowVersion: "rv-1",
    ...overrides,
  };
}

describe("usePreferencesMutationQueue (Zero 409 Race Serialization)", () => {
  it("serializes rapid preference updates FIFO and chains updated rowVersions cleanly", async () => {
    let activeRequests = 0;
    let maxConcurrent = 0;
    const observedPayloads: Array<Partial<SovereignPreferencesSlice>> = [];

    const mutate = vi.fn(async (patch: Partial<SovereignPreferencesSlice>) => {
      activeRequests += 1;
      maxConcurrent = Math.max(maxConcurrent, activeRequests);
      observedPayloads.push(patch);

      await new Promise((r) => setTimeout(r, 10));

      const nextRevNumber = observedPayloads.length + 1;
      activeRequests -= 1;
      return createPrefs({
        ...patch,
        rowVersion: `rv-${nextRevNumber}`,
      });
    });

    const onApplied = vi.fn();
    const { result } = renderHook(() =>
      usePreferencesMutationQueue({
        initialRowVersion: "rv-1",
        mutate,
        onApplied,
      })
    );

    expect(result.current.syncStatus).toBe("idle");

    let results: Array<SovereignPreferencesSlice | null> = [];
    await act(async () => {
      const p1 = result.current.enqueue({ density: "compact" });
      const p2 = result.current.enqueue({ clubAccentHue: "electric-emerald" });
      const p3 = result.current.enqueue({ reducedMotionEnabled: true });
      results = await Promise.all([p1, p2, p3]);
    });

    expect(maxConcurrent).toBe(1);
    expect(observedPayloads).toEqual([
      { density: "compact", rowVersion: "rv-1" },
      { clubAccentHue: "electric-emerald", rowVersion: "rv-2" },
      { reducedMotionEnabled: true, rowVersion: "rv-3" },
    ]);
    expect(results.map((r) => r?.rowVersion)).toEqual(["rv-2", "rv-3", "rv-4"]);
    expect(onApplied).toHaveBeenCalledTimes(3);
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.syncStatus).toBe("saved");
  });

  it("handles 409 concurrency conflict without throwing unhandled rejections and drops stale rowVersion", async () => {
    const onConflict = vi.fn();
    const onError = vi.fn();

    let callIndex = 0;
    const mutate = vi.fn(async (patch: Partial<SovereignPreferencesSlice>) => {
      callIndex += 1;
      if (callIndex === 1) {
        const conflictErr = Object.assign(new Error("Precondition conflict"), {
          status: 409,
        });
        throw conflictErr;
      }
      return createPrefs({
        ...patch,
        rowVersion: "rv-recovered",
      });
    });

    const { result } = renderHook(() =>
      usePreferencesMutationQueue({
        initialRowVersion: "rv-stale",
        mutate,
        onConflict,
        onError,
      })
    );

    let firstRes: SovereignPreferencesSlice | null = createPrefs();
    let secondRes: SovereignPreferencesSlice | null = null;

    await act(async () => {
      firstRes = await result.current.enqueue({ density: "compact" });
      secondRes = await result.current.enqueue({ operatingTimezone: "Africa/Cairo" });
    });

    expect(firstRes).toBeNull();
    expect(onConflict).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenNthCalledWith(1, { density: "compact", rowVersion: "rv-stale" });
    expect(mutate).toHaveBeenNthCalledWith(2, {
      operatingTimezone: "Africa/Cairo",
      rowVersion: undefined,
    });
    expect(secondRes).toMatchObject({
      rowVersion: "rv-recovered",
      operatingTimezone: "Africa/Cairo",
    });
  });
});
