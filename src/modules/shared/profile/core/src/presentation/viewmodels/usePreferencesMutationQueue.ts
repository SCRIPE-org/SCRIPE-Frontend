"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SovereignPreferencesSlice } from "../../domain/entities/SovereignAccountWorkstationEntities";
import { isConcurrencyConflictError } from "../utils/concurrency";

/** Synchronization indicator state for sequential preference auto-saves. */
export type PreferencesSyncStatus = "idle" | "saving" | "saved" | "error";

/** Configuration options for {@link usePreferencesMutationQueue}. */
export interface UsePreferencesMutationQueueOptions {
  initialRowVersion?: string;
  mutate: (patch: Partial<SovereignPreferencesSlice>) => Promise<SovereignPreferencesSlice>;
  onApplied?: (updated: SovereignPreferencesSlice) => void;
  onConflict?: (error: unknown) => void;
  onError?: (error: unknown) => void;
}

/** Control surface returned by {@link usePreferencesMutationQueue}. */
export interface UsePreferencesMutationQueueResult {
  enqueue: (patch: Partial<SovereignPreferencesSlice>) => Promise<SovereignPreferencesSlice | null>;
  syncStatus: PreferencesSyncStatus;
  pendingCount: number;
  lastError: unknown | null;
  clearError: () => void;
  syncExternalRowVersion: (rowVersion?: string) => void;
}

/**
 * Sequential promise queue for auto-saved workstation preferences.
 * Guarantees FIFO execution so each mutation chains onto the fresh `rowVersion`
 * returned by the previous response, eliminating optimistic-concurrency 409 races
 * when users click multiple controls rapidly.
 */
export function usePreferencesMutationQueue({
  initialRowVersion,
  mutate,
  onApplied,
  onConflict,
  onError,
}: UsePreferencesMutationQueueOptions): UsePreferencesMutationQueueResult {
  const tailRef = useRef<Promise<void>>(Promise.resolve());
  const latestRowVersionRef = useRef<string | undefined>(initialRowVersion);
  const pendingCountRef = useRef(0);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutateRef = useRef(mutate);
  const onAppliedRef = useRef(onApplied);
  const onConflictRef = useRef(onConflict);
  const onErrorRef = useRef(onError);

  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<PreferencesSyncStatus>("idle");
  const [lastError, setLastError] = useState<unknown | null>(null);

  useEffect(() => {
    mutateRef.current = mutate;
    onAppliedRef.current = onApplied;
    onConflictRef.current = onConflict;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (pendingCountRef.current === 0 && initialRowVersion !== undefined) {
      latestRowVersionRef.current = initialRowVersion;
    }
  }, [initialRowVersion]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const syncExternalRowVersion = useCallback((rowVersion?: string) => {
    if (pendingCountRef.current === 0) {
      latestRowVersionRef.current = rowVersion;
    }
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
    setSyncStatus((prev) => (prev === "error" ? "idle" : prev));
  }, []);

  const enqueue = useCallback(
    (patch: Partial<SovereignPreferencesSlice>): Promise<SovereignPreferencesSlice | null> => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }

      pendingCountRef.current += 1;
      setPendingCount(pendingCountRef.current);
      setSyncStatus("saving");
      setLastError(null);

      const executionPromise = new Promise<SovereignPreferencesSlice | null>((resolve) => {
        tailRef.current = tailRef.current.then(async () => {
          try {
            const payload: Partial<SovereignPreferencesSlice> = {
              ...patch,
              rowVersion: patch.rowVersion ?? latestRowVersionRef.current,
            };
            const updated = await mutateRef.current(payload);
            if (updated?.rowVersion !== undefined) {
              latestRowVersionRef.current = updated.rowVersion;
            }
            onAppliedRef.current?.(updated);

            pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
            setPendingCount(pendingCountRef.current);

            if (pendingCountRef.current === 0) {
              setSyncStatus("saved");
              savedTimerRef.current = setTimeout(() => {
                if (pendingCountRef.current === 0) {
                  setSyncStatus((curr) => (curr === "saved" ? "idle" : curr));
                }
              }, 2500);
            }
            resolve(updated);
          } catch (error: unknown) {
            pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
            setPendingCount(pendingCountRef.current);
            setLastError(error);
            setSyncStatus("error");

            if (isConcurrencyConflictError(error)) {
              latestRowVersionRef.current = undefined;
              onConflictRef.current?.(error);
            }
            onErrorRef.current?.(error);
            resolve(null);
          }
        });
      });

      return executionPromise;
    },
    []
  );

  return {
    enqueue,
    syncStatus,
    pendingCount,
    lastError,
    clearError,
    syncExternalRowVersion,
  };
}
